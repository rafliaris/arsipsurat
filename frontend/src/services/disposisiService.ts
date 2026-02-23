import api from '@/lib/api';
import type {
    Disposisi,
    CreateDisposisiPayload,
    UpdateDisposisiPayload,
    CompleteDisposisiPayload,
    ListDisposisiParams
} from '@/features/disposisi/types';

export const disposisiService = {
    /**
     * List all disposisi (filtered by current user - sender or receiver)
     */
    async getAll(params?: ListDisposisiParams): Promise<Disposisi[]> {
        const response = await api.get<Disposisi[]>('/disposisi', { params });
        return response.data;
    },

    /**
     * Get disposisi by ID
     */
    async getById(id: number): Promise<Disposisi> {
        const response = await api.get<Disposisi>(`/disposisi/${id}`);
        return response.data;
    },

    /**
     * Create a new disposisi for a surat masuk or keluar
     */
    async create(data: CreateDisposisiPayload): Promise<Disposisi> {
        const response = await api.post<Disposisi>('/disposisi', data);
        return response.data;
    },

    /**
     * Update a disposisi
     */
    async update(id: number, data: UpdateDisposisiPayload): Promise<Disposisi> {
        const response = await api.put<Disposisi>(`/disposisi/${id}`, data);
        return response.data;
    },

    /**
     * Mark disposisi as complete with optional note
     */
    async complete(id: number, payload: CompleteDisposisiPayload): Promise<Disposisi> {
        const response = await api.put<Disposisi>(`/disposisi/${id}/complete`, payload);
        return response.data;
    },

    /**
     * Delete a disposisi
     */
    async delete(id: number): Promise<void> {
        await api.delete(`/disposisi/${id}`);
    }
};
