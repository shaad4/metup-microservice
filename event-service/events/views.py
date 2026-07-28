from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Event
from .serializers import EventSerializer

CACHE_TTL = 60
LIST_CACHE_KEY = "events:list"

# Create your views here.

class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def list(self, request, *args, **kwargs):
        cached = cache.get(LIST_CACHE_KEY)
        if cached is not None:
            print("CACHE HIT: events:list")
            return Response(cached)

        print("CACHE MISS: events:list — querying DB")
        queryset = Event.objects.all().order_by('start_time')
        serializer = self.get_serializer(queryset, many=True)
        cache.set(LIST_CACHE_KEY, serializer.data, CACHE_TTL)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.id)
        cache.delete(LIST_CACHE_KEY)   
        print("CACHE INVALIDATED: events:list (new event created)")


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method in ('PATCH', 'PUT', 'DELETE'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        event_id = kwargs['pk']
        cache_key = f"events:detail:{event_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            print(f"CACHE HIT: {cache_key}")
            return Response(cached)

        print(f"CACHE MISS: {cache_key} — querying DB")
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        cache.set(cache_key, serializer.data, CACHE_TTL)
        return Response(serializer.data)

    def perform_update(self, serializer):
        event = self.get_object()
        if str(event.created_by) != str(self.request.user.id):
            raise PermissionDenied("Only the event creator can edit this event.")

        instance = serializer.save()
        cache.delete(f"events:detail:{instance.id}")
        cache.delete(LIST_CACHE_KEY)
        print(f"CACHE INVALIDATED: events:detail:{instance.id} and events:list")

    def perform_destroy(self, instance):
        if str(instance.created_by) != str(self.request.user.id):
            raise PermissionDenied("Only the event creator can delete this event.")
        instance.delete()
        cache.delete(f"events:detail:{instance.id}")
        cache.delete(LIST_CACHE_KEY)
    


