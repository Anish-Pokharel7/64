import { create } from 'zustand';
import { supabase } from '@api/supabase';
import { authService } from '@services/auth.service';
import { User } from '@models/user';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (user: User, token: string) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) =>
    set((state) => ({ user, isAuthenticated: !!user && !!state.token })),

  setAuthenticated: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore signout errors
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const user = await authService.getCurrentUser();
        set({
          token: sessionData.session.access_token,
          user,
          isAuthenticated: !!user,
          isInitialized: true,
        });
        return;
      }
    } catch {
      // session check failed — continue as logged out
    }
    set({ isInitialized: true });
  },
}));
