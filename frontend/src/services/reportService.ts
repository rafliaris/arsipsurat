import api from '@/lib/api';

export interface ReportParams {
    start_date?: string;  // YYYY-MM-DD
    end_date?: string;    // YYYY-MM-DD
    kategori_id?: number;
}

/**
 * Helper to trigger a file download from a blob response
 */
function downloadBlob(data: Blob, filename: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export const reportService = {
    /**
     * Export surat masuk to Excel (.xlsx)
     */
    async exportSuratMasukExcel(params?: ReportParams): Promise<void> {
        const response = await api.get('/reports/surat-masuk/excel', {
            params,
            responseType: 'blob',
        });
        downloadBlob(response.data, `surat_masuk_${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    /**
     * Export surat masuk to PDF
     */
    async exportSuratMasukPDF(params?: ReportParams): Promise<void> {
        const response = await api.get('/reports/surat-masuk/pdf', {
            params,
            responseType: 'blob',
        });
        downloadBlob(response.data, `surat_masuk_${new Date().toISOString().split('T')[0]}.pdf`);
    },

    /**
     * Export surat keluar to Excel (.xlsx)
     */
    async exportSuratKeluarExcel(params?: ReportParams): Promise<void> {
        const response = await api.get('/reports/surat-keluar/excel', {
            params,
            responseType: 'blob',
        });
        downloadBlob(response.data, `surat_keluar_${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    /**
     * Export surat keluar to PDF
     */
    async exportSuratKeluarPDF(params?: ReportParams): Promise<void> {
        const response = await api.get('/reports/surat-keluar/pdf', {
            params,
            responseType: 'blob',
        });
        downloadBlob(response.data, `surat_keluar_${new Date().toISOString().split('T')[0]}.pdf`);
    },
};
