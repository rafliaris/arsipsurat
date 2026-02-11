export interface Disposisi {
    id: string;
    surat_masuk_id: string;
    dari: string; // User ID or Name
    tujuan: string; // User ID or Name or Unit
    instruksi: string;
    sifat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
    batas_waktu: string; // YYYY-MM-DD
    catatan?: string;
    created_at: string;
    status: 'belum_dibaca' | 'dibaca' | 'selesai';
}
