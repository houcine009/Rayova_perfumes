import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type Product, type ProductCreateData, type ProductUpdateData, type ProductFilters } from '@/services/productService';

export type { Product, ProductCreateData, ProductUpdateData };

export interface ProductWithMedia extends Product { }

export const useProducts = (options?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const response = await productService.getAll(options);
      // Handle both paginated and non-paginated responses
      if ('data' in response && Array.isArray(response.data)) {
        return response.data as ProductWithMedia[];
      }
      return (response as any).data as ProductWithMedia[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await productService.getBySlug(slug);
      return response.data as ProductWithMedia;
    },
    enabled: !!slug,
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product-id', id],
    queryFn: async () => {
      const response = await productService.getById(id);
      return response.data as ProductWithMedia;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductCreateData) => {
      const response = await productService.create(product);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProductUpdateData }) => {
      const response = await productService.update(id, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await productService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Product Media hooks
export const useAddProductMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: { product_id: string; url: string; alt_text?: string; is_primary?: boolean; display_order?: number }) => {
      const { product_id, ...data } = media;
      const response = await productService.addMedia(product_id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProductMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await productService.deleteMedia(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
