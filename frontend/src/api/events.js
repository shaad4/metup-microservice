const BASE_URL = 'http://localhost:8002/api/events';

/**
 * Helper to parse backend error responses.
 */
async function parseError(response) {
  try {
    const data = await response.json();
    if (data.detail) {
      return { non_field_errors: data.detail };
    }
    const formattedErrors = {};
    for (const key in data) {
      if (Array.isArray(data[key])) {
        formattedErrors[key] = data[key][0];
      } else if (typeof data[key] === 'string') {
        formattedErrors[key] = data[key];
      } else {
        formattedErrors[key] = JSON.stringify(data[key]);
      }
    }
    return formattedErrors;
  } catch (e) {
    return { non_field_errors: 'Unable to communicate with the events server.' };
  }
}

/**
 * Fetches all events.
 */
export async function fetchEvents() {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Creates a new event.
 * @param {Object} eventData - { title, description, location, start_time, capacity }
 * @param {string} token - JWT access token
 */
export async function createEvent(eventData, token) {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Updates an existing event.
 * @param {number} eventId 
 * @param {Object} eventData 
 * @param {string} token 
 */
export async function updateEvent(eventId, eventData, token) {
  // Event detail path in events/urls.py does not end with a slash: path('<int:pk>', ...)
  const response = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Fetches details of a single event.
 * @param {number} eventId
 */
export async function fetchEventDetail(eventId) {
  const response = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Deletes an existing event.
 * @param {number} eventId
 * @param {string} token - JWT access token
 */
export async function deleteEvent(eventId, token) {
  const response = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  if (response.status === 204) {
    return true;
  }
  return response.json();
}
