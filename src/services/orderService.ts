// Order Service
import { api, type PaginatedResponse } from '@/lib/api';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        media?: { url: string }[];
    };
}

export interface Order {
    id: string;
    user_id: number | null;
    order_number: string;
    customer_name: string | null;
    status: OrderStatus;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_postal_code: string | null;
    shipping_country: string;
    shipping_phone: string | null;
    whatsapp_phone: string | null;
    billing_address: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
    user?: {
        id: number;
        name: string;
        email: string;
        profile?: {
            first_name: string | null;
            last_name: string | null;
        };
    };
}

export interface OrderCreateData {
    customer_name?: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string;
    shipping_country?: string;
    shipping_phone: string;
    whatsapp_phone?: string;
    billing_address?: string;
    notes?: string;
    subtotal?: number;
    shipping_cost?: number;
    total?: number;
    status?: string;
    items: {
        product_id: string;
        product_name: string;
        product_price: number;
        quantity: number;
        subtotal?: number;
    }[];
}

export interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    revenue: number;
    today: number;
    this_month: number;
}

export const orderService = {
    async getAll(params?: { status?: OrderStatus; search?: string; per_page?: number; page?: number }): Promise<PaginatedResponse<Order>> {
        return api.get('/orders', params as Record<string, string | number | boolean>);
    },

    async getById(id: string): Promise<{ data: Order }> {
        return api.get(`/orders/${id}`);
    },

    async create(data: OrderCreateData): Promise<{ data: Order; message: string }> {
        return api.post('/orders', data);
    },

    async updateStatus(id: string, status: OrderStatus): Promise<{ data: Order; message: string }> {
        return api.put(`/admin/orders/${id}/status`, { status });
    },

    async delete(id: string): Promise<{ message: string }> {
        return api.delete(`/admin/orders/${id}`);
    },

    async getStats(): Promise<{ data: OrderStats }> {
        return api.get('/admin/orders/stats');
    },
};
