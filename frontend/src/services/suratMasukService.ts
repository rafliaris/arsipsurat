import api from '@/lib/api';
import type {
    SuratMasuk,
    CreateSuratMasukPayload,
    UpdateSuratMasukPayload,
    ListSuratMasukParams
} from '@/features/surat-masuk/types';

export interface DetectedField {
    value: string | null;
    detected: boolean;
}

export interface DetectResult {
    file_token: string;
    file_size: number;
    original_filename: string;
    mime_type: string;
    ocr_text: string;
    ocr_confidence: number | null;
    keywords: string[];
    detected: {
        nomor_surat: DetectedField;
        perihal: DetectedField;
        tanggal_surat: DetectedField;
        pengirim: DetectedField;
        penerima?: DetectedField;
        isi_singkat?: DetectedField;
    };
    /** Present when AI extraction returned an error (e.g. 401, 429) */
    ai_error?: { code: number; message: string };
}

export interface ConfirmSuratMasukPayload {
    file_token: string;
    nomor_surat?: string;
    tanggal_surat: string;
    tanggal_terima: string;
    pengirim: string;
    perihal: string;
    isi_singkat?: string;
    kategori_id?: number;
    priority?: string;
    ocr_text?: string;
    ocr_confidence?: number;
}

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
     * Step 1: Upload file, run OCR, get detected fields + file_token
     */
    async detect(file: File, method: string = 'regex'): Promise<DetectResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('method', method);
        const response = await api.post<DetectResult>('/surat-masuk/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Step 2: Confirm and save surat masuk using the file_token from detect()
     */
    async confirm(payload: ConfirmSuratMasukPayload): Promise<SuratMasuk> {
        const formData = new FormData();
        formData.append('file_token', payload.file_token);
        formData.append('tanggal_surat', payload.tanggal_surat);
        formData.append('tanggal_terima', payload.tanggal_terima);
        formData.append('pengirim', payload.pengirim);
        formData.append('perihal', payload.perihal);
        if (payload.nomor_surat) formData.append('nomor_surat', payload.nomor_surat);
        if (payload.isi_singkat) formData.append('isi_singkat', payload.isi_singkat);
        if (payload.kategori_id) formData.append('kategori_id', payload.kategori_id.toString());
        if (payload.priority) formData.append('priority', payload.priority);
        if (payload.ocr_text) formData.append('ocr_text', payload.ocr_text);
        if (payload.ocr_confidence != null) formData.append('ocr_confidence', payload.ocr_confidence.toString());
        const response = await api.post<SuratMasuk>('/surat-masuk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Create a new surat masuk with file upload (legacy / direct upload)
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
