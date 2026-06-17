import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          console.log('Logging in with:', email);
          
          const response = await api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });

          console.log('Login response:', response.data);
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          set({ token: access_token, isLoading: false });

          // Fetch user data
          const userData = await get().fetchUser();
          console.log('User data fetched:', userData);
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Login failed. Please try again.';
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          console.log('Registering:', userData.email);
          await api.post('/api/auth/register', userData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Registration failed. Please try again.';
          return { success: false, error: message };
        }
      },

      fetchUser: async () => {
        try {
          console.log('Fetching user...');
          const response = await api.get('/api/users/me');
          console.log('User response:', response.data);
          set({ user: response.data, isAuthenticated: true });
          localStorage.setItem('user', JSON.stringify(response.data));
          return response.data;
        } catch (error) {
          console.error('Fetch user error:', error);
          get().logout();
          return null;
        }
      },

      logout: () => {
        console.log('Logging out');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      initialize: async () => {
        console.log('Initializing auth...');
        const token = localStorage.getItem('access_token');
        console.log('Token from localStorage:', token ? 'exists' : 'none');
        
        if (token) {
          set({ token });
          await get().fetchUser();
        }
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);