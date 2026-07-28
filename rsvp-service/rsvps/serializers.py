from rest_framework import serializers
from .models import RSVP


class RSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = ['id', 'event_id', 'user_id', 'status', 'created_at']
        read_only_fields = ['id', 'user_id', 'status', 'created_at']