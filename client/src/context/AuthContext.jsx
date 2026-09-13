import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
        setCharacter(data.character);
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        setStoredToken(null);
        setUser(null);
        setCharacter(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for 401 expiration events
    const handleExpired = () => {
      setUser(null);
      setCharacter(null);
    };
    window.addEventListener('liferpg_auth_expired', handleExpired);
    return () => window.removeEventListener('liferpg_auth_expired', handleExpired);
  }, []);

  const login = async (emailOrUsername, password) => {
    setError(null);
    try {
      const data = await api.login({ emailOrUsername, password });
      setStoredToken(data.token);
      setUser(data.user);
      setCharacter(data.character);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const data = await api.register({ username, email, password });
      setStoredToken(data.token);
      setUser(data.user);
      setCharacter(data.character);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const startDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.startDemo();
      setStoredToken(data.token);
      setUser(data.user);
      setCharacter(data.character);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setStoredToken(null);
      setUser(null);
      setCharacter(null);
    }
  };

  const updateCharacter = (newChar) => {
    setCharacter(prev => ({ ...prev, ...newChar }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        character,
        loading,
        error,
        login,
        register,
        startDemo,
        logout,
        updateCharacter,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
