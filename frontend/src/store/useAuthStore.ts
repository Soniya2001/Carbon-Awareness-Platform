import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/src/types';
import { setAccessToken, authApi } from '@/src/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  // Action methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setAccessToken: (token) => {
        setAccessToken(token);
        set({ accessToken: token });
      },

      setAuth: (user, token) => {
        setAccessToken(token);
        set({ user, accessToken: token, isAuthenticated: true });
      },

      clearAuth: () => {
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          const { user, accessToken: token } = res.data as { user: User; accessToken: string };
          setAccessToken(token);
          set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email: string, name: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register({ email, name, password });
          const { user, accessToken: token } = res.data as { user: User; accessToken: string };
          setAccessToken(token);
          set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          setAccessToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'carbonwise-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
