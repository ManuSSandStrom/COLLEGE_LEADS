import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/admin/me');
        if (res.data.success) {
          setAdmin(res.data.admin);
        }
      } catch (error) {
        console.error('Auth verification failed', error);
        localStorage.removeItem('token');
        setAdmin(null);
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const res = await api.post('/admin/login', { username, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setAdmin(res.data.admin);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
