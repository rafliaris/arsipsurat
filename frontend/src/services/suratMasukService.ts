import api from '@/lib/api';
import type {
    SuratMasuk,
    CreateSuratMasukPayload,
    UpdateSuratMasukPayload,
    ListSuratMasukParams
} from '@/features/surat-masuk/types';

export const suratMasukService = {
    /**
     * List all surat masuk with optional filters
     */
    async getAll(params?: ListSuratMasukParams): Promise<SuratMasuk[]> {
        const response = await api.get<SuratMasuk[]>('/surat-masuk', { params });
        return response.data;
    },

    /**
     * Get surat masuk by ID
     */
    async getById(id: number): Promise<SuratMasuk> {
        const response = await api.get<SuratMasuk>(`/surat-masuk/${id}`);
        return response.data;
    },

    /**
     * Create a new surat masuk with file upload (multipart/form-data)
     */
    async create(payload: CreateSuratMasukPayload): Promise<SuratMasuk> {
        const formData = new FormData();
        formData.append('file', payload.file);
        formData.append('tanggal_surat', payload.tanggal_surat);
        formData.append('tanggal_terima', payload.tanggal_terima);
        formData.append('pengirim', payload.pengirim);
        formData.append('perihal', payload.perihal);
        if (payload.nomor_surat) formData.append('nomor_surat', payload.nomor_surat);
        if (payload.kategori_id) formData.append('kategori_id', payload.kategori_id.toString());
        if (payload.status) formData.append('status', payload.status);
        if (payload.priority) formData.append('priority', payload.priority);

        const response = await api.post<SuratMasuk>('/surat-masuk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Update surat masuk metadata
     */
    async update(id: number, data: UpdateSuratMasukPayload): Promise<SuratMasuk> {
        const response = await api.put<SuratMasuk>(`/surat-masuk/${id}`, data);
        return response.data;
    },

    /**
     * Delete surat masuk (returns 204 No Content)
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/surat-masuk/${id}`);
    },

    /**
     * Download associated file 
     * Returns a Blob URL for the file
     */
    async downloadFile(id: number): Promise<string> {
        const response = await api.get(`/surat-masuk/${id}/file`, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    },

    /**
     * Trigger OCR reprocessing for a specific surat masuk
     */
    async reprocessOCR(id: number): Promise<SuratMasuk> {
        const response = await api.post<SuratMasuk>(`/surat-masuk/${id}/process-ocr`);
        return response.data;
    }
};
