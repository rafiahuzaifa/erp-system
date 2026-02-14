import { create } from 'zustand';
import * as authApi from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  get isAuthenticated() {
    return !!get().token;
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ token, loading: true });
    try {
      const res = await authApi.getProfile();
      set({ user: res.data, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return user;
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register({ name, email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return user;
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, error: null });
  },

  updateProfile: async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      set({ user: res.data });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Update failed');
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
