import { type SuratKeluar } from "@/features/surat-keluar/types";

// Mock Data
let mockSuratKeluar: SuratKeluar[] = [
    {
        id: "1",
        nomor_surat: "001/OUT/I/2026",
        tanggal_surat: "2026-01-20",
        tujuan: "Kepala Dinas Pendidikan",
        perihal: "Undangan Rapat Koordinasi",
        kategori: "Undangan",
        sifat: "Biasa",
        status: "terkirim",
    },
    {
        id: "2",
        nomor_surat: "002/OUT/I/2026",
        tanggal_surat: "2026-01-22",
        tujuan: "PT. Maju Jaya",
        perihal: "Balasan Penawaran",
        kategori: "Balasan",
        sifat: "Penting",
        status: "draft",
    },
];

export const mockSuratKeluarService = {
    getAll: async (): Promise<SuratKeluar[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockSuratKeluar;
    },

    getById: async (id: string): Promise<SuratKeluar | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockSuratKeluar.find((s) => s.id === id);
    },

    create: async (data: Omit<SuratKeluar, "id">): Promise<SuratKeluar> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newSurat: SuratKeluar = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        mockSuratKeluar = [newSurat, ...mockSuratKeluar];
        return newSurat;
    },

    updateStatus: async (id: string, status: SuratKeluar['status']): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockSuratKeluar = mockSuratKeluar.map(s => s.id === id ? { ...s, status } : s);
    }
};
