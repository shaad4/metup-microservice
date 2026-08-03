import os
import django
import json
import pika
import time
import socket
from datetime import timedelta
from dateutil import parser as dateparser
from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.models import Reminder
from notifications.tasks import (
    push_attendee_update, push_event_full,
    send_join_confirmation_email, send_event_reminder_email,
)

QUEUE_NAME = "metups_notifications"
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')


class Command(BaseCommand):
    help = "Consume RabbitMQ messages and dispatch Celery tasks"

    def handle(self, *args, **options):
        self.stdout.write(f"Connecting to RabbitMQ at {RABBITMQ_HOST}...")
        connection = None
        retries = 15
        for i in range(retries):
            try:
                connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
                self.stdout.write("Successfully connected to RabbitMQ.")
                break
            except (pika.exceptions.AMQPConnectionError, socket.gaierror) as e:
                self.stdout.write(f"RabbitMQ connection failed ({e}). Retrying in 5 seconds... ({i+1}/{retries})")
                time.sleep(5)

        if not connection:
            self.stderr.write("Failed to connect to RabbitMQ. Exiting.")
            return

        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        def callback(ch, method, properties, body):
            message = json.loads(body)
            msg_type = message.get("type")
            self.stdout.write(f"[CONSUMED] {msg_type}: {message}")

            if msg_type == "user_joined_event":
                push_attendee_update.delay(
                    message["event_id"], message["current_count"], message["capacity"]
                )
                send_join_confirmation_email.delay(
                    message["user_email"], message["event_title"], message["event_id"]
                )

                start_time_str = message.get("event_start_time")
                if start_time_str:
                    try:
                        start_time = dateparser.isoparse(start_time_str)
                        # Save/update a local reminder record instead of scheduling with ETA
                        Reminder.objects.update_or_create(
                            user_id=message["user_id"],
                            event_id=message["event_id"],
                            defaults={
                                "user_email": message["user_email"],
                                "event_title": message["event_title"],
                                "event_start_time": start_time,
                                "sent": False
                            }
                        )
                        self.stdout.write(f"[INFO] Created/updated reminder for user {message['user_id']} event {message['event_id']}")
                    except (ValueError, TypeError) as e:
                        self.stdout.write(f"[WARNING] Invalid event_start_time '{start_time_str}': {e}")
                    except Exception as e:
                        self.stdout.write(f"[ERROR] Failed to save reminder: {e}")
                else:
                    self.stdout.write("[SKIP] No event_start_time provided in message")

            elif msg_type == "user_left_event":
                push_attendee_update.delay(
                    message["event_id"], message["current_count"], message["capacity"]
                )
                # Delete the reminder if it exists
                try:
                    Reminder.objects.filter(
                        user_id=message["user_id"],
                        event_id=message["event_id"]
                    ).delete()
                    self.stdout.write(f"[INFO] Deleted reminder for user {message['user_id']} event {message['event_id']}")
                except Exception as e:
                    self.stdout.write(f"[ERROR] Failed to delete reminder: {e}")

            elif msg_type == "event_full":
                push_event_full.delay(
                    message["event_id"], message["current_count"], message["capacity"]
                )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
        self.stdout.write("Waiting for notification messages. To exit press CTRL+C")
        channel.start_consuming()