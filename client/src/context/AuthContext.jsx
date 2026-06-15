import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create API Client with defaults
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor to catch unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clean auth session locally if token expires
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    
    const handleLogoutEvent = () => {
      setUser(null);
    };
    
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data && res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, avatar) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post('/api/auth/register', { name, email, password, avatar });
      if (res.data && res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // Call auth/me update if added, otherwise mock update
      setUser(prev => ({ ...prev, ...profileData }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkUser,
        updateProfile,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
