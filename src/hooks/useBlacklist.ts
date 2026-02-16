import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BlacklistedPhone {
    id: string;
    phone: string;
    reason: string | null;
    created_at: string;
}

export const useBlacklist = () => {
    const queryClient = useQueryClient();

    const blacklistQuery = useQuery({
        queryKey: ['blacklist'],
        queryFn: async () => {
            const response = await api.get<{ data: BlacklistedPhone[] }>('/admin/blacklist');
            return response.data;
        },
    });

    const addToBlacklist = useMutation({
        mutationFn: async (data: { phone: string; reason?: string }) => {
            return api.post('/admin/blacklist', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blacklist'] });
        },
    });

    const removeFromBlacklist = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/blacklist/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blacklist'] });
        },
    });

    return {
        blacklist: blacklistQuery.data,
        isLoading: blacklistQuery.isLoading,
        addToBlacklist,
        removeFromBlacklist,
    };
};
