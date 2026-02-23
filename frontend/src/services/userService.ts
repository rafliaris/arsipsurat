import api from '@/lib/api';
import type { User } from '@/features/settings/types';

export interface ListUsersParams {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    role?: 'admin' | 'user';
}

export interface CreateUserPayload {
    username: string;
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'user';
}

export interface UpdateUserPayload {
    full_name?: string;
    email?: string;
    role?: 'admin' | 'user';
    is_active?: boolean;
    password?: string;
}

export interface UpdateProfilePayload {
    full_name?: string;
    email?: string;
    avatar?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export const userService = {
    /**
     * List all users (admin only)
     */
    async getAll(params?: ListUsersParams): Promise<User[]> {
        const response = await api.get<User[]>('/users', { params });
        return response.data;
    },

    /**
     * Get a specific user by ID (admin only)
     */
    async getById(id: number): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    /**
     * Create a new user (admin only)
     */
    async create(data: CreateUserPayload): Promise<User> {
        const response = await api.post<User>('/users', data);
        return response.data;
    },

    /**
     * Update a user (admin only)
     */
    async update(id: number, data: UpdateUserPayload): Promise<User> {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Delete a user (admin only)
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    /**
     * Update own profile
     */
    async updateProfile(data: UpdateProfilePayload): Promise<User> {
        const response = await api.put<User>('/auth/me', data);
        return response.data;
    },

    /**
     * Change own password
     */
    async changePassword(data: ChangePasswordPayload): Promise<{ message: string }> {
        const response = await api.put<{ message: string }>('/auth/change-password', data);
        return response.data;
    }
};
