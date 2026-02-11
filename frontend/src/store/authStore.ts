import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AuthState } from '@/features/auth/types';
import { authService } from '@/services/authService';

interface AuthActions {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (username, password) => {
                try {
                    const response = await authService.login(username, password);
                    const token = response.access_token;
                    // Token is set in state, but we also need to set it in axios header (interceptor handles it via getState, 
                    // but for the immediate me() call we might rely on the token being in state)
                    set({ token, isAuthenticated: true });

                    const user = await authService.me();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    console.error("Login failed", error);
                    throw error;
                }
            },
            logout: () => {
                authService.logout().catch(console.error);
                set({ user: null, token: null, isAuthenticated: false });
            },
            checkAuth: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const user = await authService.me();
                    set({ user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
