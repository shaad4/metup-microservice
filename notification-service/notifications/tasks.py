import urllib.request
import json
import hashlib
import os
from dateutil import parser as dateparser
from celery import shared_task

EVENT_SERVICE_URL = os.environ.get("EVENT_SERVICE_URL", "http://localhost:8002")
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from notifications.models import Reminder


@shared_task
def push_attendee_update(event_id, current_count, capacity):
    channel_layer = get_channel_layer()
    # Event-specific group
    async_to_sync(channel_layer.group_send)(
        f"event_{event_id}",
        {
            "type": "attendee.update",
            "event_id": event_id,
            "current_count": current_count,
            "capacity": capacity,
        },
    )
    # Global group
    async_to_sync(channel_layer.group_send)(
        "all_events",
        {
            "type": "attendee.update",
            "event_id": event_id,
            "current_count": current_count,
            "capacity": capacity,
        },
    )
    print(f"[WS PUSH] event_{event_id} → {current_count}/{capacity}")


@shared_task
def push_event_full(event_id, current_count, capacity):
    channel_layer = get_channel_layer()
    # Event-specific group
    async_to_sync(channel_layer.group_send)(
        f"event_{event_id}",
        {
            "type": "event.full",
            "event_id": event_id,
            "current_count": current_count,
            "capacity": capacity,
        },
    )
    # Global group
    async_to_sync(channel_layer.group_send)(
        "all_events",
        {
            "type": "event.full",
            "event_id": event_id,
            "current_count": current_count,
            "capacity": capacity,
        },
    )
    print(f"[WS PUSH] event_{event_id} is now FULL")


@shared_task
def send_join_confirmation_email(user_email, event_title, event_id):
    # Fetch details from event-service
    details = None
    url = f"{EVENT_SERVICE_URL}/api/events/{event_id}"
    try:
        req = urllib.request.Request(url, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                details = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"[EMAIL] Failed to fetch event details for {event_id}: {e}")

    # Fallback details if fetching fails
    if not details:
        details = {
            "title": event_title,
            "description": "Your upcoming gathering.",
            "location": "To Be Determined",
            "start_time": "",
            "created_by": "Host"
        }

    # Format Date & Time
    start_time_str = details.get("start_time")
    if start_time_str:
        try:
            dt = dateparser.isoparse(start_time_str)
            event_date = dt.strftime("%A, %B %d, %Y")
            event_time = dt.strftime("%I:%M %p").lstrip('0')
        except Exception:
            event_date = "Upcoming Date"
            event_time = "TBD"
    else:
        event_date = "Upcoming Date"
        event_time = "TBD"

    # Generate a unique Ticket ID
    # Hash together event_id and user_email for uniqueness
    hasher = hashlib.md5(f"{event_id}-{user_email}".encode('utf-8'))
    ticket_id = f"METUP-{hasher.hexdigest()[:8].upper()}"

    # Render HTML Context
    context = {
        "event_title": details.get("title") or event_title,
        "event_description": details.get("description"),
        "event_date": event_date,
        "event_time": event_time,
        "event_location": details.get("location") or "To Be Determined",
        "user_email": user_email,
        "host_id": details.get("created_by") or "Host",
        "ticket_id": ticket_id
    }

    html_content = render_to_string("notifications/ticket_email.html", context)
    text_content = f"You're in: {context['event_title']}\nTicket ID: {context['ticket_id']}\nDate: {context['event_date']} at {context['event_time']}\nLocation: {context['event_location']}"

    msg = EmailMultiAlternatives(
        subject=f"🎟️ Your Ticket: {context['event_title']}",
        body=text_content,
        from_email=None,
        to=[user_email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    print(f"[EMAIL] Creative ticket HTML email sent to {user_email} for event {event_id}")


@shared_task
def send_event_reminder_email(user_email, event_title, event_id=None):
    details = None
    if event_id:
        url = f"{EVENT_SERVICE_URL}/api/events/{event_id}"
        try:
            req = urllib.request.Request(url, headers={'Accept': 'application/json'})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status == 200:
                    details = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"[EMAIL] Failed to fetch event details for reminder {event_id}: {e}")

    # Fallback details if fetching fails or event_id not provided
    if not details:
        details = {
            "title": event_title,
            "description": "Your upcoming gathering.",
            "location": "To Be Determined",
            "start_time": "",
            "created_by": "Host"
        }

    # Format Date & Time
    start_time_str = details.get("start_time")
    if start_time_str:
        try:
            dt = dateparser.isoparse(start_time_str)
            event_date = dt.strftime("%A, %B %d, %Y")
            event_time = dt.strftime("%I:%M %p").lstrip('0')
        except Exception:
            event_date = "Upcoming Date"
            event_time = "TBD"
    else:
        event_date = "Upcoming Date"
        event_time = "TBD"

    # Render HTML Context
    context = {
        "event_title": details.get("title") or event_title,
        "event_description": details.get("description"),
        "event_date": event_date,
        "event_time": event_time,
        "event_location": details.get("location") or "To Be Determined",
        "user_email": user_email,
        "host_id": details.get("created_by") or "Host"
    }

    html_content = render_to_string("notifications/reminder_email.html", context)
    text_content = f"Reminder: {context['event_title']} is coming up in 24 hours.\nDate: {context['event_date']} at {context['event_time']}\nLocation: {context['event_location']}"

    msg = EmailMultiAlternatives(
        subject=f"⏰ Reminder: {context['event_title']} starts in 24 hours",
        body=text_content,
        from_email=None,
        to=[user_email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    print(f"[EMAIL] HTML reminder email sent to {user_email} for event {event_id}")


@shared_task
def check_and_send_reminders():
    now = timezone.now()
    upcoming_limit = now + timedelta(hours=24)
    # Query for unsent reminders starting in the next 24 hours (and in the future)
    reminders = Reminder.objects.filter(
        sent=False,
        event_start_time__lte=upcoming_limit,
        event_start_time__gt=now
    )
    for reminder in reminders:
        # Avoid race conditions by marking sent first
        reminder.sent = True
        reminder.save(update_fields=['sent'])

        # Dispatch the email task immediately
        send_event_reminder_email.delay(
            user_email=reminder.user_email,
            event_title=reminder.event_title,
            event_id=reminder.event_id
        )
        print(f"[SCHEDULER] Dispatched reminder for {reminder.user_email} (event {reminder.event_id})")