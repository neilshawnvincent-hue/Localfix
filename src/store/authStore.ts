import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'worker' | null;
export type Language = 'en' | 'hi' | null;

type AuthState = {
  language: Language;
  role: UserRole;
  isLoggedIn: boolean;
  isVerified: boolean; // KYC verified (workers only)
  phone: string;
  userName: string;
  userId: string | null;

  // The chosen role BEFORE the account exists (used during sign-up only).
  pendingRole: UserRole;

  hasHydrated: boolean;

  setRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  login: (phone: string) => void;
  logout: () => void;
  verify: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      language: null,
      role: null,
      isLoggedIn: false,
      isVerified: false,
      phone: '',
      userName: '',
      userId: null,
      pendingRole: null,
      hasHydrated: false,

      setRole: (role) => set({ pendingRole: role, role }),
      setLanguage: (lang) => set({ language: lang }),

      login: (phone: string) => {
        set({
          isLoggedIn: true,
          phone,
          role: get().pendingRole ?? get().role ?? 'customer',
          userId: `mock-user-${Date.now()}`,
          userName: phone.endsWith('0') ? 'Rajesh Kumar' : 'Priya Sharma',
        });
      },

      logout: () => {
        set({
          role: null,
          pendingRole: null,
          isLoggedIn: false,
          isVerified: false,
          phone: '',
          userName: '',
          userId: null,
        });
      },

      verify: () => set({ isVerified: true }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'localfix-auth-mock',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
