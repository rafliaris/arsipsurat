export interface SuratKeluar {
    id: string;
    nomor_surat: string;
    tanggal_surat: string; // YYYY-MM-DD
    tujuan: string; // Recipient
    perihal: string;
    kategori: string;
    sifat: 'Biasa' | 'Penting' | 'Rahasia';
    status: 'draft' | 'terkirim' | 'arsip';
    file_url?: string;
}

export type SuratKeluarStatus = SuratKeluar['status'];
