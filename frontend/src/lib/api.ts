import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        // Prevent infinite loop: Don't trigger logout if the error came from logout endpoint
        // Prevent infinite loop: Don't trigger logout if the error came from logout endpoint
        const isLogoutRequest = error.config?.url?.includes('/auth/logout');

        if (error.response?.status === 401) {
            if (!isLogoutRequest) {
                useAuthStore.getState().clearAuth();
            }
            // If it IS a logout request and failed (401), we also just want to clear local state
            // because it means the token is already invalid.
            if (isLogoutRequest) {
                useAuthStore.getState().clearAuth();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
