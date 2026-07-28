from django.db import models

# Create your models here.

class RSVP(models.Model):
    STATUS_CHOICES = [
        ('joined', 'Joined'),
        ('cancelled', 'Cancelled'),
    ]

    event_id = models.IntegerField()
    user_id = models.IntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='joined')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event_id', 'user_id')

    def __str__(self):
        return f"user={self.user_id} event={self.event_id} status={self.status}"
