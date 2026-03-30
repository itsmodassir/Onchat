import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  shortId: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  coins: number;
  diamonds: number;
  crystals: number;
  familyId?: string;
  level?: number;
  isReseller?: boolean;
  aristocracyLevel?: number;
  svipLevel?: number;
  _count?: {
    followers: number;
    following: number;
    rooms: number;
  };
}

interface AuthState {
  user: User | null;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'onchat-auth-storage',
    }
  )
);
