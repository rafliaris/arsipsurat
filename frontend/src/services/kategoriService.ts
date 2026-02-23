import api from '@/lib/api';
import type { Kategori, CreateKategoriPayload, UpdateKategoriPayload } from '@/features/settings/types';

export const kategoriService = {
    /**
     * List all categories
     */
    async getAll(params?: { skip?: number; limit?: number; is_active?: boolean }): Promise<Kategori[]> {
        const response = await api.get<Kategori[]>('/kategori', { params });
        return response.data;
    },

    /**
     * Get category by ID
     */
    async getById(id: number): Promise<Kategori> {
        const response = await api.get<Kategori>(`/kategori/${id}`);
        return response.data;
    },

    /**
     * Create a new category (Admin only)
     */
    async create(data: CreateKategoriPayload): Promise<Kategori> {
        const response = await api.post<Kategori>('/kategori', data);
        return response.data;
    },

    /**
     * Update a category (Admin only)
     */
    async update(id: number, data: UpdateKategoriPayload): Promise<Kategori> {
        const response = await api.put<Kategori>(`/kategori/${id}`, data);
        return response.data;
    },

    /**
     * Delete a category (Admin only)
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/kategori/${id}`);
    }
};
