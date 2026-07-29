from django.core.cache import cache
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Event
from .serializers import EventSerializer

from elasticsearch_dsl import Q
from .documents import EventDocument

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
        queryset = Event.objects.filter(start_time__gte=timezone.now()).order_by('start_time')
        serializer = self.get_serializer(queryset, many=True)
        cache.set(LIST_CACHE_KEY, serializer.data, CACHE_TTL)
        return Response(serializer.data)

    def perform_create(self, serializer):
        start_time = serializer.validated_data.get('start_time')
        if start_time and start_time < timezone.now():
            raise ValidationError({"eventDate": "Cannot create events in the past."})
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
        if event.start_time < timezone.now():
            raise PermissionDenied("Cannot modify past events.")

        instance = serializer.save()
        cache.delete(f"events:detail:{instance.id}")
        cache.delete(LIST_CACHE_KEY)
        print(f"CACHE INVALIDATED: events:detail:{instance.id} and events:list")

    def perform_destroy(self, instance):
        if str(instance.created_by) != str(self.request.user.id):
            raise PermissionDenied("Only the event creator can delete this event.")
        if instance.start_time < timezone.now():
            raise PermissionDenied("Cannot delete past events.")
        instance.delete()
        cache.delete(f"events:detail:{instance.id}")
        cache.delete(LIST_CACHE_KEY)
    
class EventSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q','').strip()

        if not query:
            return Response({"detail": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

        search = EventDocument.search().query(
            Q('multi_match', query=query, fields=['title^3', 'description', 'location^2'], type='phrase_prefix')
        ).filter('range', start_time={'gte': timezone.now().isoformat()})

        response = search[:50].execute()

        results = [
            {
                "id": hit.meta.id,
                "title": hit.title,
                "description": hit.description,
                "location": hit.location,
                "start_time": hit.start_time,
                "capacity": hit.capacity,
                "created_by": hit.created_by,
            }
            for hit in response
        ]

        return Response({"count": len(results), "results": results})


