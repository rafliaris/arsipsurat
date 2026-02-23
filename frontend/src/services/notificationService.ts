import api from '@/lib/api';

export interface Notification {
    id: number;
    tipe: 'surat_masuk' | 'surat_keluar' | 'disposisi' | 'deadline' | 'status_update' | 'system';
    judul: string;
    pesan: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

export interface NotificationStats {
    total: number;
    unread: number;
    by_type: Record<string, number>;
}

export interface ListNotificationParams {
    skip?: number;
    limit?: number;
    is_read?: boolean;
    tipe?: string;
}

export const notificationService = {
    /**
     * List notifications for current user
     */
    async getAll(params?: ListNotificationParams): Promise<Notification[]> {
        const response = await api.get<Notification[]>('/notifications', { params });
        return response.data;
    },

    /**
     * Get notification stats (unread count etc.)
     */
    async getStats(): Promise<NotificationStats> {
        const response = await api.get<NotificationStats>('/notifications/stats');
        return response.data;
    },

    /**
     * Get a single notification by ID
     */
    async getById(id: number): Promise<Notification> {
        const response = await api.get<Notification>(`/notifications/${id}`);
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(id: number): Promise<Notification> {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    /**
     * Mark ALL notifications as read
     */
    async markAllAsRead(): Promise<{ message: string }> {
        const response = await api.put<{ message: string }>('/notifications/read-all');
        return response.data;
    },

    /**
     * Delete a notification
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/notifications/${id}`);
    },

    /**
     * Shortcut: get unread count only
     */
    async getUnreadCount(): Promise<number> {
        const stats = await notificationService.getStats();
        return stats.unread;
    }
};
