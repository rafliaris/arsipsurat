export interface SuratMasuk {
    id: string;
    nomor_surat: string;
    tanggal_surat: string; // YYYY-MM-DD
    tanggal_terima: string; // YYYY-MM-DD
    pengirim: string;
    perihal: string;
    kategori: string;
    status: 'pending' | 'disposisi' | 'selesai';
    file_url?: string;
}

export type SuratMasukStatus = SuratMasuk['status'];
