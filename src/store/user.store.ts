import { create } from 'zustand';
import { User } from '@models/user';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<Pick<User, 'fullName' | 'email' | 'phone'>>) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}));
