from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Event


@registry.register_document
class EventDocument(Document):
    class Index:
        name = "events"
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'location',
            'start_time',
            'capacity',
            'created_by',
        ]