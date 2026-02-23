// Matches backend API schema from FRONTEND_API_DOCS.md

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at?: string;
    avatar?: string;
}

export interface Kategori {
    id: number;
    nama: string;
    slug: string;
    deskripsi?: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateKategoriPayload {
    nama: string;
    slug: string;
    deskripsi?: string;
    color: string;
}

export interface UpdateKategoriPayload {
    nama?: string;
    slug?: string;
    deskripsi?: string;
    color?: string;
    is_active?: boolean;
}

export interface AppSetting {
    id?: number;
    setting_key: string;
    setting_value: string;
    setting_type?: string;
    description?: string;
    is_public?: boolean;
    updated_by?: number;
    updated_at?: string;
}

// Keep backward compat alias
export type Category = Kategori;
