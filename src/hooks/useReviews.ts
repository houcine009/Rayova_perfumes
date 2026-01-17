import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type Review, type ReviewCreateData } from '@/services/reviewService';

export type { Review, ReviewCreateData };

export const useReviews = (productId?: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (productId) {
        const response = await reviewService.getProductReviews(productId);
        return response.data;
      }
      const response = await reviewService.getAll();
      return response.data;
    },
  });
};

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: async () => {
      const response = await reviewService.getProductReviews(productId);
      return {
        reviews: response.data,
        stats: response.stats,
      };
    },
    enabled: !!productId,
  });
};

export const usePendingReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: async () => {
      const response = await reviewService.getAll({ pending: true });
      return response.data;
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: ReviewCreateData) => {
      const response = await reviewService.create(review);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.product_id] });
    },
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reviewService.approve(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useRejectReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await reviewService.reject(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await reviewService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
