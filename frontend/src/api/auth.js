const BASE_URL = 'http://localhost:8001/api/auth';

/**
 * Parses error responses from the backend API and converts them into user-friendly strings.
 * @param {Response} response - The fetch response object
 * @returns {Promise<Object>} An object containing the parsed error message mapping
 */
async function parseError(response) {
  try {
    const data = await response.json();
    
    // If it's a simple JWT login error
    if (data.detail) {
      return { non_field_errors: data.detail };
    }
    
    // Convert array error formats to string messages
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
    return { non_field_errors: 'Unable to connect to the authentication server.' };
  }
}

/**
 * Registers a new user.
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 */
export async function registerUser(username, email, password) {
  const response = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}

/**
 * Authenticates a user.
 * @param {string} username 
 * @param {string} password 
 */
export async function loginUser(username, password) {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errors = await parseError(response);
    throw errors;
  }

  return response.json();
}
