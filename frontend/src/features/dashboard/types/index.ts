export interface DashboardStats {
    total_surat_masuk: number;
    total_surat_keluar: number;
    surat_masuk_bulan_ini: number;
    surat_keluar_bulan_ini: number;
    disposisi_pending: number;
    disposisi_selesai: number;
    notifikasi_unread: number;
    total_kategori: number;
}

export interface RecentActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    created_at: string;
    link: string;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color: string;
}

// Chart data for Recharts (used in OverviewChart)
export interface TrendChartData {
    name: string;
    Masuk: number;
    Keluar: number;
}
