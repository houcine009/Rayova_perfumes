// Settings Service
import { api } from '@/lib/api';

export interface HeroSettings {
    title: string;
    subtitle: string;
    description?: string;
    description_color_light?: string;
    description_color_dark?: string;
    cta_primary: string;
    cta_secondary: string;
    video_url: string | null;
    image_url: string | null;
}

export interface ContactSettings {
    email: string;
    phone: string;
    address: string;
    whatsapp?: string;
}

export interface SocialSettings {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    tiktok?: string | null;
}

export interface OpeningSoonSettings {
    enabled: boolean;
    title: string;
    subtitle: string;
    description: string;
    video_url: string | null;
    image_url: string | null;
}

export const settingsService = {
    async getAll(): Promise<{ data: Record<string, unknown> }> {
        return api.get('/settings');
    },

    async get<T = unknown>(key: string): Promise<{ data: T | null }> {
        return api.get(`/settings/${key}`);
    },

    async update<T = unknown>(key: string, value: T): Promise<{ data: T; message: string }> {
        return api.put(`/admin/settings/${key}`, { value });
    },

    async bulkUpdate(settings: Array<{ key: string; value: unknown }>): Promise<{ message: string }> {
        return api.post('/admin/settings/bulk', { settings });
    },

    // Convenience methods
    async getHero(): Promise<HeroSettings | null> {
        const response = await settingsService.get<HeroSettings>('hero');
        return response.data;
    },

    async updateHero(data: Partial<HeroSettings>): Promise<{ data: HeroSettings; message: string }> {
        return this.update('hero', data);
    },

    async getContact(): Promise<ContactSettings | null> {
        const response = await settingsService.get<ContactSettings>('contact');
        return response.data;
    },

    async updateContact(data: Partial<ContactSettings>): Promise<{ data: ContactSettings; message: string }> {
        return this.update('contact', data);
    },

    async getSocial(): Promise<SocialSettings | null> {
        const response = await settingsService.get<SocialSettings>('social');
        return response.data;
    },

    async updateSocial(data: Partial<SocialSettings>): Promise<{ data: SocialSettings; message: string }> {
        return this.update('social', data);
    },
};
