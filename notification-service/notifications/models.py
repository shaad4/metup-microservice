from django.db import models

class Reminder(models.Model):
    user_id = models.IntegerField()
    user_email = models.EmailField()
    event_id = models.IntegerField()
    event_title = models.CharField(max_length=255)
    event_start_time = models.DateTimeField()
    sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_id', 'event_id')

    def __str__(self):
        return f"Reminder for User {self.user_id} - Event {self.event_id} ({self.user_email})"

