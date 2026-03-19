import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';
const fallbackURL = isProduction ? 'https://college-leads.onrender.com/api' : 'http://localhost:5000/api';
const baseURL = (import.meta.env.VITE_API_URL || fallbackURL).replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
