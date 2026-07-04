import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://eppl.uad.ac.id/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eppl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eppl_token');
      localStorage.removeItem('eppl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
