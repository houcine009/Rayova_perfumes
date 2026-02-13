// Product Service
import { api, type PaginatedResponse } from '@/lib/api';

export interface ProductMedia {
    id: string;
    product_id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
    mime_type?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    price: number;
    original_price: number | null;
    sku: string | null;
    stock_quantity: number;
    gender: 'homme' | 'femme' | 'unisexe' | 'niche';
    is_featured: boolean;
    is_new: boolean;
    is_active: boolean;
    volume_ml: number | null;
    notes_top: string | null;
    notes_heart: string | null;
    notes_base: string | null;
    brand: string;
    created_at: string;
    updated_at: string;
    media?: ProductMedia[];
    categories?: Category[];
    category_ids?: string[];
    rating?: number;
    reviews_count?: number;
}

export interface ProductFilters {
    featured?: boolean;
    gender?: string;
    category?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    per_page?: number;
    page?: number;
}

export interface ProductCreateData {
    name: string;
    slug?: string;
    description?: string;
    short_description?: string;
    price: number;
    original_price?: number;
    sku?: string;
    stock_quantity?: number;
    gender: 'homme' | 'femme' | 'unisexe' | 'niche';
    is_featured?: boolean;
    is_new?: boolean;
    is_active?: boolean;
    volume_ml?: number;
    notes_top?: string;
    notes_heart?: string;
    notes_base?: string;
    brand?: string;
    category_ids?: string[];
    rating?: number;
    reviews_count?: number;
}

export interface ProductUpdateData extends Partial<ProductCreateData> { }

export const productService = {
    async getAll(filters?: ProductFilters, isAdmin: boolean = false): Promise<{ data: Product[] } | PaginatedResponse<Product>> {
        const prefix = isAdmin ? '/admin' : '';
        return api.get(`${prefix}/products`, filters as Record<string, string | number | boolean>);
    },

    async getBySlug(slug: string): Promise<{ data: Product }> {
        return api.get(`/products/${slug}`);
    },

    async getById(id: string): Promise<{ data: Product }> {
        return api.get(`/products/id/${id}`);
    },

    async create(data: ProductCreateData): Promise<{ data: Product; message: string }> {
        return api.post('/admin/products', data);
    },

    async update(id: string, data: ProductUpdateData): Promise<{ data: Product; message: string }> {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/admin/products/${id}`, data);
        }
        return api.put(`/admin/products/${id}`, data);
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/products/${id}`);
    },

    async addMedia(productId: string, data: { url: string; alt_text?: string; is_primary?: boolean; display_order?: number }): Promise<{ data: ProductMedia; message: string }> {
        return api.post(`/admin/products/${productId}/media`, data);
    },

    async deleteMedia(mediaId: string): Promise<{ message: string }> {
        return api.delete(`/admin/products/media/${mediaId}`);
    },
};
