import api from '@/lib/api';

export interface AuditLog {
    id: number;
    user_id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED';
    table_name: string;
    record_id?: number;
    description: string;
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    created_at: string;
}

export interface AuditStats {
    total: number;
    by_action: Record<string, number>;
    by_table: Record<string, number>;
    by_user: Record<string, number>;
}

export interface ListAuditParams {
    skip?: number;
    limit?: number;
    action?: string;
    table_name?: string;
    user_id?: number;
    days?: number;
}

export const auditService = {
    /**
     * List audit logs (admin only)
     */
    async getAll(params?: ListAuditParams): Promise<AuditLog[]> {
        const response = await api.get<AuditLog[]>('/audit', { params });
        return response.data;
    },

    /**
     * Get audit stats (admin only)
     */
    async getStats(days?: number): Promise<AuditStats> {
        const response = await api.get<AuditStats>('/audit/stats', { params: { days } });
        return response.data;
    },

    /**
     * Get a single audit log detail
     */
    async getById(id: number): Promise<AuditLog> {
        const response = await api.get<AuditLog>(`/audit/${id}`);
        return response.data;
    },

    /**
     * Get audit history for a specific user (admin only)
     */
    async getByUser(userId: number, params?: Omit<ListAuditParams, 'user_id'>): Promise<AuditLog[]> {
        const response = await api.get<AuditLog[]>(`/audit/user/${userId}`, { params });
        return response.data;
    }
};
