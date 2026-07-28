from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@shared_task
def push_attendee_update(event_id, current_count, capacity):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"event_{event_id}",
        {"type": "attendee.update", "current_count": current_count, "capacity": capacity},
    )
    print(f"[WS PUSH] event_{event_id} → {current_count}/{capacity}")


@shared_task
def push_event_full(event_id, current_count, capacity):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"event_{event_id}",
        {"type": "event.full", "current_count": current_count, "capacity": capacity},
    )
    print(f"[WS PUSH] event_{event_id} is now FULL")


@shared_task
def send_join_confirmation_email(user_email, event_title, event_id):
    send_mail(
        subject=f"You're in: {event_title}",
        message=f"You've successfully joined {event_title}. See you there!",
        from_email=None,
        recipient_list=[user_email],
    )
    print(f"[EMAIL] join confirmation sent to {user_email}")


@shared_task
def send_event_reminder_email(user_email, event_title):
    send_mail(
        subject=f"Reminder: {event_title} starts in 24 hours",
        message=f"Just a reminder — {event_title} is coming up in 24 hours.",
        from_email=None,
        recipient_list=[user_email],
    )
    print(f"[EMAIL] reminder sent to {user_email}")