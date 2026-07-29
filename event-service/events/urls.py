from django.urls import path
from .views import EventListCreateView, EventDetailView, EventSearchView

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('search', EventSearchView.as_view(), name='event-search'),
    path('search/', EventSearchView.as_view(), name='event-search-slash'),
    path('<int:pk>', EventDetailView.as_view(), name='event-detail'),
]