// Newsletter Service
import { api, type PaginatedResponse } from '@/lib/api';

export interface NewsletterSubscriber {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NewsletterStats {
    total: number;
    active: number;
    inactive: number;
    today: number;
    this_month: number;
}

export const newsletterService = {
    async getAll(params?: { active_only?: boolean; search?: string; per_page?: number }): Promise<PaginatedResponse<NewsletterSubscriber>> {
        return api.get('/admin/newsletter', params as Record<string, string | number | boolean>);
    },

    async subscribe(email: string): Promise<{ message: string }> {
        return api.post('/newsletter/subscribe', { email });
    },

    async unsubscribe(email: string): Promise<{ message: string }> {
        return api.post('/newsletter/unsubscribe', { email });
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/newsletter/${id}`);
    },

    async getStats(): Promise<{ data: NewsletterStats }> {
        return api.get('/admin/newsletter/stats');
    },
};
