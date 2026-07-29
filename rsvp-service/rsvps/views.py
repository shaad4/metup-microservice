from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from .rabbitmq_publisher import publish_message

from .models import RSVP
from .serializers import RSVPSerializer
from grpc_clients.event_client import check_capacity


# Create your views here.


class JoinEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        user_id = request.user.id
        user_email = request.user.email

        exists, capacity, error, event_title, event_start_time = check_capacity(event_id)
        if not exists:
            raise NotFound(error or "Event not found")

        rsvp, created = RSVP.objects.get_or_create(
            event_id=event_id,
            user_id=user_id,
            defaults={'status': 'joined'}
        )

        if not created:
            if rsvp.status == 'joined':
                return Response(
                    {"detail": "You have already joined this event."},
                    status=status.HTTP_200_OK
                )
        else:
            pass  

        current_joined = RSVP.objects.filter(event_id=event_id, status='joined').exclude(pk=rsvp.pk).count()

        if current_joined >= capacity:
            if created:
                rsvp.delete()
            raise ValidationError("This event is full.")

        rsvp.status = 'joined'
        rsvp.save()

        new_count = current_joined + 1

        publish_message({
            "type": "user_joined_event",
            "event_id": event_id,
            "event_title": event_title,
            "event_start_time": event_start_time,
            "user_id": user_id,
            "user_email": user_email,
            "current_count": new_count,
            "capacity": capacity,
        })

        if new_count == capacity:
            publish_message({
                "type": "event_full",
                "event_id": event_id,
                "event_title": event_title,
                "current_count": new_count,
                "capacity": capacity,
            })


        return Response(RSVPSerializer(rsvp).data, status=status.HTTP_201_CREATED)

class LeaveEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        user_id = request.user.id

        try:
            rsvp = RSVP.objects.get(event_id=event_id, user_id=user_id, status='joined')
        except RSVP.DoesNotExist:
            raise NotFound("You have not joined this event.")

        rsvp.status = 'cancelled'
        rsvp.save()

        exists, capacity, error, event_title, event_start_time = check_capacity(event_id)
        if exists:
            new_count = RSVP.objects.filter(event_id=event_id, status='joined').count()
            publish_message({
                "type": "user_left_event",
                "event_id": event_id,
                "event_title": event_title,
                "event_start_time": event_start_time,
                "user_id": user_id,
                "current_count": new_count,
                "capacity": capacity,
            })

        return Response({"detail": "Left event."}, status=status.HTTP_200_OK)

class MyEventsView(generics.ListAPIView):
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RSVP.objects.filter(user_id=self.request.user.id, status='joined').order_by('-created_at')


class RSVPStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        joined = RSVP.objects.filter(
            event_id=event_id, user_id=request.user.id, status='joined'
        ).exists()
        return Response({"joined": joined})


class RSVPCountView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, event_id):
        count = RSVP.objects.filter(event_id=event_id, status='joined').count()
        return Response({"current_count": count})
