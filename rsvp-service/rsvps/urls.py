from django.urls import path
from .views import JoinEventView, LeaveEventView, MyEventsView, RSVPStatusView

urlpatterns = [
    path('<int:event_id>/join', JoinEventView.as_view(), name='rsvp-join'),
    path('<int:event_id>/leave', LeaveEventView.as_view(), name='rsvp-leave'),
    path('<int:event_id>/status', RSVPStatusView.as_view(), name='rsvp-status'),
    path('my-events', MyEventsView.as_view(), name='rsvp-my-events'),
]