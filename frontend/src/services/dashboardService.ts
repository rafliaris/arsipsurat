import api from '@/lib/api';
import type { DashboardStats, RecentActivity, ChartDataPoint } from '@/features/dashboard/types';

export interface TrendDataPoint {
    label: string;
    masuk: number;
    keluar: number;
}

export const dashboardService = {
    /**
     * Get dashboard statistics
     */
    async getStats(): Promise<DashboardStats> {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },

    /**
     * Get recent activity timeline
     * @param limit - Number of activities to fetch (default: 10)
     */
    async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
        const response = await api.get<RecentActivity[]>('/dashboard/recent', {
            params: { limit }
        });
        return response.data;
    },

    /**
     * Get chart data by category
     * @param jenis - Type of surat: 'masuk' or 'keluar' (default: 'masuk')
     */
    async getChartsByKategori(jenis: 'masuk' | 'keluar' = 'masuk'): Promise<ChartDataPoint[]> {
        const response = await api.get<ChartDataPoint[]>('/dashboard/charts/by-kategori', {
            params: { jenis }
        });
        return response.data;
    },

    /**
     * Get chart data by month
     * @param months - Number of months to fetch (default: 6)
     */
    async getChartsByMonth(months: number = 6): Promise<ChartDataPoint[]> {
        const response = await api.get<ChartDataPoint[]>('/dashboard/charts/by-month', {
            params: { months }
        });
        return response.data;
    },

    /**
     * Get combined masuk + keluar trend data by month
     * @param months - Number of months to fetch (default: 6)
     */
    async getTrend(months: number = 6): Promise<TrendDataPoint[]> {
        const response = await api.get<TrendDataPoint[]>('/dashboard/charts/trend', {
            params: { months }
        });
        return response.data;
    },
};

