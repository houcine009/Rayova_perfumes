// User Service (Admin)
import { api, type PaginatedResponse } from '@/lib/api';
import type { User, Profile } from './authService';

export interface UserWithProfile extends User {
    profile: Profile | null;
}

export interface UserStats {
    total: number;
    users: number;
    admins: number;
    super_admins: number;
    today: number;
    this_month: number;
}

export interface UserCreateData {
    email: string;
    password: string;
    name?: string;
    role?: 'user' | 'admin' | 'super_admin';
    first_name?: string;
    last_name?: string;
}

export const userService = {
    async getAll(params?: { search?: string; role?: string; per_page?: number; page?: number }): Promise<PaginatedResponse<UserWithProfile>> {
        return api.get('/admin/users', params as Record<string, string | number | boolean>);
    },

    async getById(id: string): Promise<{ data: UserWithProfile }> {
        return api.get(`/admin/users/${id}`);
    },

    async create(data: UserCreateData): Promise<{ data: UserWithProfile; message: string }> {
        return api.post('/admin/users', data);
    },

    async updateRole(id: string, role: 'user' | 'admin' | 'super_admin'): Promise<{ data: User; message: string }> {
        return api.put(`/admin/users/${id}/role`, { role });
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/users/${id}`);
    },

    async getStats(): Promise<{ data: UserStats }> {
        return api.get('/admin/users/stats');
    },
};
