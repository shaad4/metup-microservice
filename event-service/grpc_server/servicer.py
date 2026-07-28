import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_service.settings')
django.setup()

from events.models import Event

import event_pb2
import event_pb2_grpc


class EventInternalServicer(event_pb2_grpc.EventInternalServicer):
    def CheckCapacity(self, request, context):
        try:
            event = Event.objects.get(pk=int(request.event_id))
            return event_pb2.CapacityResponse(
                exists=True,
                capacity=event.capacity,
                error=""
            )
        except Event.DoesNotExist:
            return event_pb2.CapacityResponse(exists=False, capacity=0, error="Event not found")
        except (ValueError, TypeError):
            return event_pb2.CapacityResponse(exists=False, capacity=0, error="Invalid event_id")