import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type Order, type OrderCreateData, type OrderStatus } from '@/services/orderService';

export type { Order, OrderCreateData, OrderStatus };

export interface OrderWithItems extends Order { }

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await orderService.getAll();
      return response.data as OrderWithItems[];
    },
  });
};

export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: async () => {
      // The API automatically filters by user for non-admin users
      const response = await orderService.getAll();
      return response.data as OrderWithItems[];
    },
    enabled: !!userId,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await orderService.getById(id);
      return response.data as OrderWithItems;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderCreateData) => {
      const response = await orderService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await orderService.updateStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await orderService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: async () => {
      const response = await orderService.getStats();
      return response.data;
    },
  });
};
