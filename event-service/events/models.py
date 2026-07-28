from django.db import models

# Create your models here.


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    created_by = models.IntegerField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
