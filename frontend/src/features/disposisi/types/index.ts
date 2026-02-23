// Matches backend API schema from FRONTEND_API_DOCS.md

export interface Disposisi {
    id: number;
    surat_type: 'masuk' | 'keluar';
    surat_masuk_id?: number;
    surat_keluar_id?: number;
    from_user_id: number;
    to_user_id: number;
    instruksi: string;
    keterangan?: string;
    status: 'PENDING' | 'PROSES' | 'SELESAI';
    deadline?: string; // YYYY-MM-DD
    created_at: string;
}

export interface CreateDisposisiPayload {
    surat_type: 'masuk' | 'keluar';
    surat_masuk_id?: number;
    surat_keluar_id?: number;
    to_user_id: number;
    instruksi: string;
    keterangan?: string;
    deadline?: string;
}

export interface UpdateDisposisiPayload {
    instruksi?: string;
    keterangan?: string;
    deadline?: string;
}

export interface CompleteDisposisiPayload {
    keterangan: string;
}

export interface ListDisposisiParams {
    skip?: number;
    limit?: number;
    status?: string;
    surat_type?: string;
}

export type DisposisiStatus = Disposisi['status'];
