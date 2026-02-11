import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AuthState } from '@/features/auth/types';
import { authService } from '@/services/authService';

interface AuthActions {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>; // Updated to Promise
    clearAuth: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (username, password) => {
                try {
                    const response = await authService.login(username, password);
                    const token = response.access_token;
                    set({ token, isAuthenticated: true });

                    const user = await authService.me();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    console.error("Login failed", error);
                    throw error;
                }
            },
            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error("Logout failed", error);
                } finally {
                    get().clearAuth();
                }
            },
            clearAuth: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const user = await authService.me();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    get().clearAuth();
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
