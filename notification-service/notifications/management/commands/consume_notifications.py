import os
import django
import json
import pika
from datetime import timedelta
from dateutil import parser as dateparser
from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.tasks import (
    push_attendee_update, push_event_full,
    send_join_confirmation_email, send_event_reminder_email,
)

QUEUE_NAME = "metups_notifications"
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')


class Command(BaseCommand):
    help = "Consume RabbitMQ messages and dispatch Celery tasks"

    def handle(self, *args, **options):
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
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
                        reminder_time = start_time - timedelta(hours=24)
                        if reminder_time > timezone.now():
                            send_event_reminder_email.apply_async(
                                args=[message["user_email"], message["event_title"], message.get("event_id")],
                                eta=reminder_time,
                            )
                        else:
                            self.stdout.write("[SKIP] event starts in <24h, no reminder scheduled")
                    except (ValueError, TypeError) as e:
                        self.stdout.write(f"[WARNING] Invalid event_start_time '{start_time_str}': {e}")
                else:
                    self.stdout.write("[SKIP] No event_start_time provided in message")

            elif msg_type == "user_left_event":
                push_attendee_update.delay(
                    message["event_id"], message["current_count"], message["capacity"]
                )

            elif msg_type == "event_full":
                push_event_full.delay(
                    message["event_id"], message["current_count"], message["capacity"]
                )

            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
        self.stdout.write("Waiting for notification messages. To exit press CTRL+C")
        channel.start_consuming()