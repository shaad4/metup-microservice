import React, { createContext, useState, useContext } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize access token state from localStorage
  const [accessToken, setAccessTokenState] = useState(() => {
    return localStorage.getItem('metups_access_token') || null;
  });

  // Initialize user details state from localStorage
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('metups_access_token');
    const storedUser = localStorage.getItem('metups_user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user session:', e);
        return null;
      }
    }
    return null;
  });

  // Synchronize state and localStorage updates for the token
  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem('metups_access_token', token);
    } else {
      localStorage.removeItem('metups_access_token');
    }
    setAccessTokenState(token);
  };

  const getDeterministicChar = (name) => {
    const chars = ['green-spiky', 'blob', 'flow', 'ghoast', 'hot', 'pokoe', 'purppler', 'sloopy', 'star'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return chars[Math.abs(hash) % chars.length];
  };

  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password);
      setAccessToken(data.access);
      
      // Decode user_id from the JWT payload
      let userId = null;
      try {
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        userId = payload.user_id;
      } catch (e) {
        console.error('Failed to decode JWT payload:', e);
      }

      const characterId = localStorage.getItem(`metups_char_${username}`) || getDeterministicChar(username);
      const userInfo = { id: userId, username, characterId };
      setUser(userInfo);
      localStorage.setItem('metups_user', JSON.stringify(userInfo));
      console.log('Login successful. Session persisted.');
      return { success: true };
    } catch (errors) {
      console.error('Login error in AuthContext:', errors);
      throw errors;
    }
  };

  const register = async (username, email, password, characterId) => {
    try {
      const data = await registerUser(username, email, password);
      setAccessToken(data.access);

      let userId = null;
      if (data.user && data.user.id) {
        userId = data.user.id;
      } else {
        try {
          const payload = JSON.parse(atob(data.access.split('.')[1]));
          userId = payload.user_id;
        } catch (e) {}
      }

      const finalCharId = characterId || getDeterministicChar(username);
      const userInfo = { id: userId, username, characterId: finalCharId };
      setUser(userInfo);
      localStorage.setItem('metups_user', JSON.stringify(userInfo));
      
      if (finalCharId) {
        localStorage.setItem(`metups_char_${username}`, finalCharId);
      }

      console.log('Registration successful. Session persisted.');
      return { success: true };
    } catch (errors) {
      console.error('Registration error in AuthContext:', errors);
      throw errors;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('metups_access_token');
    localStorage.removeItem('metups_user');
    console.log('User logged out. Session cleared.');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
