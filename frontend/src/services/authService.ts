import api from '@/lib/api';

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        // FastAPI OAuth2PasswordRequestForm expects form-data
        const response = await api.post<LoginResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async me(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.put('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    },
};
