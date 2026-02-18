// Authentication Service
import { api } from '@/lib/api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

export interface Profile {
    id: number;
    user_id: number;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    role: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    password_confirmation: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ProfileUpdateData {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
}

export const authService = {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/register', data);
        if (response.token) {
            api.setToken(response.token);
        }
        return response;
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', data);
        if (response.token) {
            api.setToken(response.token);
        }
        return response;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/logout');
        } finally {
            api.setToken(null);
        }
    },

    async getCurrentUser(): Promise<{ user: User; profile: Profile | null; role: string; isAdmin: boolean; isSuperAdmin: boolean }> {
        return api.get('/user');
    },

    async updateProfile(data: ProfileUpdateData): Promise<{ user: User; message: string }> {
        return api.put('/user/profile', data);
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return api.post('/forgot-password', { email });
    },

    async resetPassword(data: any): Promise<{ message: string }> {
        return api.post('/reset-password', data);
    },

    isAuthenticated(): boolean {
        return !!api.getToken();
    },

    clearAuth(): void {
        api.setToken(null);
    },
};
