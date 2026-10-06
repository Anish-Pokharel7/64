import { create } from 'zustand';

type LocationState = {
  currentLocation: string;
  isLocating: boolean;
  setLocation: (location: string) => void;
  setLocating: (value: boolean) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: 'Home — Main Road, Itahari',
  isLocating: false,
  setLocation: (location) => set({ currentLocation: location }),
  setLocating: (value) => set({ isLocating: value }),
}));

export function useLocation() {
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const isLocating = useLocationStore((s) => s.isLocating);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setLocating = useLocationStore((s) => s.setLocating);

  return {
    currentLocation,
    isLocating,
    setLocation,
    setLocating,
  };
}
