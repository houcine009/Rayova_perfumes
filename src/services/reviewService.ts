// Review Service
import { api, type PaginatedResponse } from '@/lib/api';

export interface Review {
    id: string;
    product_id: string;
    user_id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    is_verified_purchase: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        profile?: {
            first_name: string | null;
            last_name: string | null;
        };
    };
    product?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface ReviewStats {
    count: number;
    average: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface ReviewCreateData {
    product_id: string;
    rating: number;
    title?: string;
    comment?: string;
}

export const reviewService = {
    async getAll(params?: { product_id?: string; pending?: boolean; per_page?: number }): Promise<PaginatedResponse<Review>> {
        return api.get('/admin/reviews', params as Record<string, string | number | boolean>);
    },

    async getProductReviews(productId: string): Promise<{ data: Review[]; stats: ReviewStats }> {
        return api.get(`/products/${productId}/reviews`);
    },

    async create(data: ReviewCreateData): Promise<{ data: Review; message: string }> {
        // Use the clean GuestFeedbackController route
        const token = localStorage.getItem('auth_token');
        const endpoint = token ? '/reviews' : '/feedback';
        return api.post(endpoint, data);
    },

    async approve(id: string): Promise<{ data: Review; message: string }> {
        return api.put(`/admin/reviews/${id}/approve`);
    },

    async reject(id: string): Promise<{ data: Review; message: string }> {
        return api.put(`/admin/reviews/${id}/reject`);
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/reviews/${id}`);
    },
};
