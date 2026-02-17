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
    async getStats(period?: string): Promise<{ data: DashboardStats }> {
        return api.get('/admin/dashboard/stats', period ? { period } : undefined);
    },

    async getRecentOrders(): Promise<{ data: Order[] }> {
        return api.get('/admin/dashboard/recent-orders');
    },

    async getTopProducts(period?: string): Promise<{ data: Product[] }> {
        return api.get('/admin/dashboard/top-products', period ? { period } : undefined);
    },
};
