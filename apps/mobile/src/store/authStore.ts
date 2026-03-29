import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isHydrated: boolean;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHydrated: (v) => set({ isHydrated: v }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'onchat-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
