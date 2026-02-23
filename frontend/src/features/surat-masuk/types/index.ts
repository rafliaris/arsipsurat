// Matches backend API schema from FRONTEND_API_DOCS.md

export interface Kategori {
    id: number;
    nama: string;
    slug: string;
    deskripsi?: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface SuratMasuk {
    id: number;
    nomor_surat: string;
    tanggal_surat: string; // YYYY-MM-DD
    tanggal_terima: string; // YYYY-MM-DD
    pengirim: string;
    perihal: string;
    kategori_id?: number;
    kategori?: Kategori;
    status: 'pending' | 'proses' | 'selesai';
    priority: 'rendah' | 'sedang' | 'tinggi' | 'mendesak';
    file_path?: string;
    ocr_text?: string;
    ocr_keywords?: string[];
    confidence_score?: number;
    created_by?: number;
    created_at: string;
}

export interface CreateSuratMasukPayload {
    file: File;
    nomor_surat?: string;
    tanggal_surat: string;
    tanggal_terima: string;
    pengirim: string;
    perihal: string;
    kategori_id?: number;
    status?: string;
    priority?: string;
}

export interface UpdateSuratMasukPayload {
    nomor_surat?: string;
    tanggal_surat?: string;
    pengirim?: string;
    perihal?: string;
    kategori_id?: number;
    status?: string;
    priority?: string;
}

export interface ListSuratMasukParams {
    skip?: number;
    limit?: number;
    search?: string;
    kategori_id?: number;
    status?: string;
    priority?: string;
}

export type SuratMasukStatus = SuratMasuk['status'];
export type SuratMasukPriority = SuratMasuk['priority'];
