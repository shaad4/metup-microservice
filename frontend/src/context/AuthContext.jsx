import React, { createContext, useState, useContext } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password);
      setAccessToken(data.access);
      
      // Attempt to decode user_id from the JWT token
      let userId = null;
      try {
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        userId = payload.user_id;
      } catch (e) {
        console.error('Failed to decode JWT payload:', e);
      }

      setUser({ id: userId, username });
      console.log('Login successful. Token acquired:', data.access);
      return { success: true };
    } catch (errors) {
      console.error('Login error in AuthContext:', errors);
      throw errors;
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await registerUser(username, email, password);
      setUser(data.user);
      setAccessToken(data.access);
      console.log('Registration successful. User:', data.user, 'Token:', data.access);
      return { success: true };
    } catch (errors) {
      console.error('Registration error in AuthContext:', errors);
      throw errors;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    console.log('User logged out.');
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
