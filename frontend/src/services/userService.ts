import api from '@/lib/api';
import type { User } from '@/features/settings/types';

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface ListUsersParams {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    role?: UserRole;
    search?: string;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    full_name: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserPayload {
    full_name?: string;
    email?: string;
    role?: UserRole;
    is_active?: boolean;
}

export interface UpdateProfilePayload {
    full_name?: string;
    email?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export interface ResetPasswordPayload {
    new_password?: string;               // if omitted, backend auto-generates
    force_change_on_login?: boolean;
}

export interface ResetPasswordResponse {
    message: string;
    temporary_password?: string;
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
     * Toggle user active/inactive status (admin only)
     */
    async toggleActive(id: number): Promise<User> {
        const response = await api.put<User>(`/users/${id}/toggle-active`);
        return response.data;
    },

    /**
     * Reset a user's password (admin only)
     * If new_password is omitted, backend generates a temporary one
     */
    async resetPassword(id: number, data?: ResetPasswordPayload): Promise<ResetPasswordResponse> {
        const response = await api.post<ResetPasswordResponse>(`/users/${id}/reset-password`, data ?? {});
        return response.data;
    },

    /**
     * Delete a user — soft delete (admin only)
     */
    async delete(id: number): Promise<{ message: string }> {
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
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
    },
};
