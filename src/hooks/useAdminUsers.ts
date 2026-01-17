import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserWithProfile, type UserCreateData } from '@/services/userService';

export type { UserWithProfile, UserCreateData };

export const useAdminUsers = (params?: { search?: string; role?: string }) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const response = await userService.getAll(params);
      return response.data;
    },
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const response = await userService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserCreateData) => {
      const response = await userService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'user' | 'admin' | 'super_admin' }) => {
      const response = await userService.updateRole(id, role);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['admin-users', 'stats'],
    queryFn: async () => {
      const response = await userService.getStats();
      return response.data;
    },
  });
};
