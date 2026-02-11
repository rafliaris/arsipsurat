import { type SuratMasuk } from "@/features/surat-masuk/types";

// Mock Data
let mockSuratMasuk: SuratMasuk[] = [
    {
        id: "1",
        nomor_surat: "001/ABC/I/2026",
        tanggal_surat: "2026-01-15",
        tanggal_terima: "2026-01-16",
        pengirim: "PT. Sinar Jaya",
        perihal: "Undangan Rapat Koordinasi",
        kategori: "Undangan",
        status: "pending",
    },
    {
        id: "2",
        nomor_surat: "002/XYZ/I/2026",
        tanggal_surat: "2026-01-18",
        tanggal_terima: "2026-01-19",
        pengirim: "Dinas Pendidikan",
        perihal: "Pemberitahuan Lomba",
        kategori: "Pemberitahuan",
        status: "disposisi",
    },
    {
        id: "3",
        nomor_surat: "003/DEF/I/2026",
        tanggal_surat: "2026-01-20",
        tanggal_terima: "2026-01-21",
        pengirim: "CV. Makmur Abadi",
        perihal: "Penawaran Kerjasama",
        kategori: "Penawaran",
        status: "selesai",
    },
];

export const mockSuratMasukService = {
    getAll: async (): Promise<SuratMasuk[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
        return mockSuratMasuk;
    },

    getById: async (id: string): Promise<SuratMasuk | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockSuratMasuk.find((s) => s.id === id);
    },

    create: async (data: Omit<SuratMasuk, "id">): Promise<SuratMasuk> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newSurat: SuratMasuk = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        mockSuratMasuk = [newSurat, ...mockSuratMasuk];
        return newSurat;
    },

    updateStatus: async (id: string, status: SuratMasuk['status']): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockSuratMasuk = mockSuratMasuk.map(s => s.id === id ? { ...s, status } : s);
    }
};
