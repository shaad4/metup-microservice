from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'start_time', 'capacity', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']