import { type Disposisi } from "@/features/disposisi/types";

// Mock Data
let mockDisposisi: Disposisi[] = [
    {
        id: "1",
        surat_masuk_id: "1", // Linked to the first mock Surat Masuk
        dari: "Kepala Dinas",
        tujuan: "Sekretaris",
        instruksi: "Mohon ditindaklanjuti",
        sifat: "Segera",
        batas_waktu: "2026-01-20",
        catatan: "Koordinasikan dengan bidang terkait",
        created_at: "2026-01-16T10:00:00Z",
        status: "dibaca"
    }
];

export const mockDisposisiService = {
    getBySuratMasukId: async (suratId: string): Promise<Disposisi[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockDisposisi.filter((d) => d.surat_masuk_id === suratId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    getAll: async (): Promise<Disposisi[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockDisposisi.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    create: async (data: Omit<Disposisi, "id" | "created_at" | "status">): Promise<Disposisi> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newDisposisi: Disposisi = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            status: 'belum_dibaca'
        };
        mockDisposisi = [newDisposisi, ...mockDisposisi];
        return newDisposisi;
    }
};
