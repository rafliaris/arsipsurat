import api from '@/lib/api';
import type {
    SuratKeluar,
    CreateSuratKeluarPayload,
    UpdateSuratKeluarPayload,
    ListSuratKeluarParams
} from '@/features/surat-keluar/types';

export interface DetectedFieldKeluar {
    value: string | null;
    detected: boolean;
}

export interface DetectKeluarResult {
    file_token: string;
    file_size: number;
    original_filename: string;
    mime_type: string;
    ocr_text: string;
    ocr_confidence: number | null;
    keywords: string[];
    detected: {
        penerima: DetectedFieldKeluar;
        perihal: DetectedFieldKeluar;
        tanggal_surat: DetectedFieldKeluar;
        isi_singkat?: DetectedFieldKeluar;
    };
    /** Present when AI extraction returned an error (e.g. 401, 429) */
    ai_error?: { code: number; message: string };
}

export interface ConfirmSuratKeluarPayload {
    file_token: string;
    tanggal_surat: string;
    penerima: string;
    perihal: string;
    tembusan?: string;
    isi_singkat?: string;
    kategori_id?: number;
    priority?: string;
    ocr_text?: string;
    ocr_confidence?: number;
}

export const suratKeluarService = {
    /** List all surat keluar with optional filters */
    async getAll(params?: ListSuratKeluarParams): Promise<SuratKeluar[]> {
        const response = await api.get<SuratKeluar[]>('/surat-keluar', { params });
        return response.data;
    },

    /** Get surat keluar by ID */
    async getById(id: number): Promise<SuratKeluar> {
        const response = await api.get<SuratKeluar>(`/surat-keluar/${id}`);
        return response.data;
    },

    /** Step 1: Upload file, run OCR, get detected fields + file_token */
    async detect(file: File, method: string = 'regex'): Promise<DetectKeluarResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('method', method);
        const response = await api.post<DetectKeluarResult>('/surat-keluar/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /** Step 2: Confirm and save surat keluar using file_token from detect() */
    async confirm(payload: ConfirmSuratKeluarPayload): Promise<SuratKeluar> {
        const formData = new FormData();
        formData.append('file_token', payload.file_token);
        formData.append('tanggal_surat', payload.tanggal_surat);
        formData.append('penerima', payload.penerima);
        formData.append('perihal', payload.perihal);
        if (payload.tembusan) formData.append('tembusan', payload.tembusan);
        if (payload.isi_singkat) formData.append('isi_singkat', payload.isi_singkat);
        if (payload.kategori_id) formData.append('kategori_id', payload.kategori_id.toString());
        if (payload.priority) formData.append('priority', payload.priority);
        if (payload.ocr_text) formData.append('ocr_text', payload.ocr_text);
        if (payload.ocr_confidence != null) formData.append('ocr_confidence', payload.ocr_confidence.toString());
        const response = await api.post<SuratKeluar>('/surat-keluar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /** Create a new surat keluar (legacy / direct upload) */
    async create(payload: CreateSuratKeluarPayload): Promise<SuratKeluar> {
        const formData = new FormData();
        formData.append('file', payload.file);
        formData.append('tanggal_surat', payload.tanggal_surat);
        formData.append('penerima', payload.penerima);
        formData.append('perihal', payload.perihal);
        formData.append('kategori_id', payload.kategori_id.toString());
        if (payload.status) formData.append('status', payload.status);
        if (payload.priority) formData.append('priority', payload.priority);
        const response = await api.post<SuratKeluar>('/surat-keluar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /** Update surat keluar metadata */
    async update(id: number, data: UpdateSuratKeluarPayload): Promise<SuratKeluar> {
        const response = await api.put<SuratKeluar>(`/surat-keluar/${id}`, data);
        return response.data;
    },

    /** Delete surat keluar (returns 204 No Content) */
    async delete(id: number): Promise<void> {
        await api.delete(`/surat-keluar/${id}`);
    },

    /** Download associated file — returns a Blob URL */
    async downloadFile(id: number): Promise<string> {
        const response = await api.get(`/surat-keluar/${id}/file`, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    }
};
