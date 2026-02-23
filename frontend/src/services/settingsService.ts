import api from '@/lib/api';
import type { AppSetting } from '@/features/settings/types';

export const settingsService = {
    /**
     * Get public settings (no auth required)
     */
    async getPublic(): Promise<AppSetting[]> {
        const response = await api.get<AppSetting[]>('/settings/public');
        return response.data;
    },

    /**
     * Get all settings (admin only)
     */
    async getAll(): Promise<AppSetting[]> {
        const response = await api.get<AppSetting[]>('/settings');
        return response.data;
    },

    /**
     * Get a specific setting by key
     */
    async getByKey(key: string): Promise<AppSetting> {
        const response = await api.get<AppSetting>(`/settings/${key}`);
        return response.data;
    },

    /**
     * Update a setting (admin only)
     */
    async update(key: string, value: string): Promise<AppSetting> {
        const response = await api.put<AppSetting>(`/settings/${key}`, { setting_value: value });
        return response.data;
    },

    /**
     * Reset all settings to defaults (admin only)
     */
    async reset(): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>('/settings/reset');
        return response.data;
    }
};
