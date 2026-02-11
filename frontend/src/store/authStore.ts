import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/features/auth/types';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user: User, token: string) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // unique name for localStorage key
        }
    )
);
