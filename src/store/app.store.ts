import { create } from 'zustand';

type AppState = {
  selectedAddressLabel: string | null;
  hasOnboarded: boolean;
  setSelectedAddressLabel: (label: string | null) => void;
  setHasOnboarded: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedAddressLabel: 'Home',
  hasOnboarded: false,
  setSelectedAddressLabel: (label) => set({ selectedAddressLabel: label }),
  setHasOnboarded: (value) => set({ hasOnboarded: value }),
}));
