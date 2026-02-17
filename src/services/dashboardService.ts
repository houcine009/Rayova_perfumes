// Dashboard Service
import { api } from '@/lib/api';
import type { Order } from './orderService';
import type { Product } from './productService';

export interface DashboardStats {
    products: {
        total: number;
        active: number;
        featured: number;
        low_stock: number;
    };
    categories: {
        total: number;
        active: number;
    };
    orders: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        revenue: number;
        total_shipping: number;
        today: number;
        this_month: number;
    };
    users: {
        total: number;
        admins: number;
    };
    reviews: {
        total: number;
        pending: number;
        approved: number;
    };
}

export const dashboardService = {
    async getStats(period?: string, date?: string, month?: number, year?: number): Promise<{ data: DashboardStats }> {
        const params: Record<string, string | number> = {};
        if (period) params.period = period;
        if (date) params.date = date;
        if (month) params.month = month;
        if (year) params.year = year;
        return api.get('/admin/dashboard/stats', Object.keys(params).length > 0 ? params : undefined);
    },

    async getRecentOrders(): Promise<{ data: Order[] }> {
        return api.get('/admin/dashboard/recent-orders');
    },

    async getTopProducts(period?: string, date?: string, month?: number, year?: number): Promise<{ data: Product[] }> {
        const params: Record<string, string | number> = {};
        if (period) params.period = period;
        if (date) params.date = date;
        if (month) params.month = month;
        if (year) params.year = year;
        return api.get('/admin/dashboard/top-products', Object.keys(params).length > 0 ? params : undefined);
    },
};
