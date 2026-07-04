import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('eppl_user') || 'null'),
  token: localStorage.getItem('eppl_token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password, device_name: 'web' });
      const { user, token } = res.data.data;
      localStorage.setItem('eppl_token', token);
      localStorage.setItem('eppl_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.username?.[0] || 'Login gagal';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        localStorage.setItem('eppl_user', JSON.stringify(user));
        set({ user });
      }
    } catch {}
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('eppl_token');
    localStorage.removeItem('eppl_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('eppl_token'),
}));

export default useAuthStore;
