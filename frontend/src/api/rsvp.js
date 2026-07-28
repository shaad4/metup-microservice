const BASE_URL = 'http://localhost:8003/api/rsvp';

/**
 * Parses error responses from the backend RSVP API.
 * @param {Response} response - The fetch response object
 * @returns {Promise<Object>} Formatted errors map
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
    return { non_field_errors: 'Unable to communicate with the RSVP server.' };
  }
}

/**
 * Fetches RSVP status for a specific event.
 * @param {number|string} eventId
 * @param {string} token
 */
export async function getRsvpStatus(eventId, token) {
  const response = await fetch(`${BASE_URL}/${eventId}/status`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Joins a specific event.
 * @param {number|string} eventId
 * @param {string} token
 */
export async function joinEvent(eventId, token) {
  const response = await fetch(`${BASE_URL}/${eventId}/join`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Leaves a specific event.
 * @param {number|string} eventId
 * @param {string} token
 */
export async function leaveEvent(eventId, token) {
  const response = await fetch(`${BASE_URL}/${eventId}/leave`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Fetches all RSVPs for the logged-in user.
 * @param {string} token
 */
export async function getMyEvents(token) {
  const response = await fetch(`${BASE_URL}/my-events`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}
