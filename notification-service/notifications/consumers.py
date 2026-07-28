import json
from channels.generic.websocket import AsyncWebsocketConsumer


class EventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.event_id = self.scope['url_route']['kwargs']['event_id']
        self.group_name = f"event_{self.event_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Called when something sends a "attendee.update" type message to the group
    async def attendee_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "attendee_update",
            "current_count": event["current_count"],
            "capacity": event["capacity"],
        }))

    async def event_full(self, event):
        await self.send(text_data=json.dumps({
            "type": "event_full",
            "current_count": event["current_count"],
            "capacity": event["capacity"],
        }))