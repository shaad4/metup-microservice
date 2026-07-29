import os
import pika
import json

RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'localhost')
QUEUE_NAME = "metups_notifications"

def publish_message(message: dict):
    """Fire-and-forget publish. Never let a broken queue block a join."""
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2),  # persist to disk
        )
        connection.close()
    except Exception as e:
        print(f"[RabbitMQ] publish failed (non-fatal): {e}")