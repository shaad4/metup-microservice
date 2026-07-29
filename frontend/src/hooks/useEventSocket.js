import { useEffect, useState } from 'react';

/**
 * Custom hook to manage the lifecycle of a WebSocket connection for real-time event updates.
 * 
 * @param {number|string} eventId - The ID of the event to listen for.
 * @param {number} initialCount - Initial RSVP count fetched on mount.
 * @param {number} capacity - The maximum attendee capacity.
 * @returns {{ currentCount: number, isFull: boolean }}
 */
export function useEventSocket(eventId, initialCount, capacity) {
  const [currentCount, setCurrentCount] = useState(initialCount);

  // Sync state if the initial count updates after API response
  useEffect(() => {
    setCurrentCount(initialCount);
  }, [initialCount]);

  const isFull = currentCount >= capacity;

  useEffect(() => {
    if (!eventId) return;

    let socket;
    let reconnectTimeout;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;

      const wsUrl = `ws://${window.location.hostname}:8005/ws/events/${eventId}/`;
      try {
        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'attendee_update' || data.type === 'event_full') {
              if (typeof data.current_count === 'number') {
                setCurrentCount(data.current_count);
              }
            }
          } catch (err) {
            console.error('[WS] Failed to parse message body:', err);
          }
        };

        socket.onerror = (error) => {
          console.error(`[WS] Error on connection for event ${eventId}:`, error);
        };

        socket.onclose = (event) => {
          console.log(`[WS] Connection closed for event ${eventId} (code: ${event.code}). Reconnecting in 3s...`);
          if (!isClosed) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch (e) {
        console.error('[WS] Failed to create WebSocket connection:', e);
        if (!isClosed) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isClosed = true;
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [eventId]);

  return { currentCount, isFull };
}
