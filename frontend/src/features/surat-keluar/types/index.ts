// Matches backend API schema from FRONTEND_API_DOCS.md

export interface SuratKeluar {
    id: number;
    nomor_surat_keluar: string;
    tanggal_surat: string; // YYYY-MM-DD
    penerima: string;
    perihal: string;
    kategori_id?: number;
    kategori?: {
        id: number;
        nama: string;
        slug: string;
    };
    status: 'pending' | 'proses' | 'selesai';
    priority: 'rendah' | 'sedang' | 'tinggi' | 'mendesak';
    file_path?: string;
    created_by?: number;
    created_at?: string;
}

export interface CreateSuratKeluarPayload {
    file: File;
    tanggal_surat: string;
    penerima: string;
    perihal: string;
    kategori_id: number;
    status?: string;
    priority?: string;
}

export interface UpdateSuratKeluarPayload {
    tanggal_surat?: string;
    penerima?: string;
    perihal?: string;
    kategori_id?: number;
    status?: string;
    priority?: string;
}

export interface ListSuratKeluarParams {
    skip?: number;
    limit?: number;
    search?: string;
    kategori_id?: number;
    status?: string;
    priority?: string;
}

export type SuratKeluarStatus = SuratKeluar['status'];
export type SuratKeluarPriority = SuratKeluar['priority'];
