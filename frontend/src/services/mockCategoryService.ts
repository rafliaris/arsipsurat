import { type Category } from "@/features/settings/types";

let mockCategories: Category[] = [
    {
        id: "1",
        name: "Undangan",
        description: "Surat undangan kegiatan atau rapat dinas",
        color: "#8B5CF6", // Purple
        created_at: "2026-01-01T00:00:00Z"
    },
    {
        id: "2",
        name: "Pemberitahuan",
        description: "Surat pemberitahuan atau edaran",
        color: "#EC4899", // Pink
        created_at: "2026-01-01T00:00:00Z"
    },
    {
        id: "3",
        name: "Permohonan",
        description: "Surat permohonan izin, bantuan, dll",
        color: "#F59E0B", // Amber
        created_at: "2026-01-01T00:00:00Z"
    }
];

export const mockCategoryService = {
    getAll: async (): Promise<Category[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockCategories;
    },

    create: async (data: Omit<Category, "id" | "created_at">): Promise<Category> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newCategory: Category = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
        };
        mockCategories = [...mockCategories, newCategory];
        return newCategory;
    },

    delete: async (id: string): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        mockCategories = mockCategories.filter(c => c.id !== id);
    }
};
