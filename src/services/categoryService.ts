// Category Service
import { api } from '@/lib/api';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategoryCreateData {
    name: string;
    slug?: string;
    description?: string;
    image_url?: string;
    display_order?: number;
    is_active?: boolean;
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> { }

export const categoryService = {
    async getAll(): Promise<{ data: Category[] }> {
        return api.get('/categories');
    },

    async getBySlug(slug: string): Promise<{ data: Category }> {
        return api.get(`/categories/${slug}`);
    },

    async create(data: CategoryCreateData): Promise<{ data: Category; message: string }> {
        if (data instanceof FormData) {
            return api.post('/admin/categories', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return api.post('/admin/categories', data);
    },

    async update(id: string, data: CategoryUpdateData): Promise<{ data: Category; message: string }> {
        // If updating an image, handle multipart
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/admin/categories/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }

        // Standard update
        return api.put(`/admin/categories/${id}`, data);
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/categories/${id}`);
    },
};
