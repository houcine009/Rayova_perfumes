import { useMutation } from '@tanstack/react-query';
import { mediaService, type UploadResponse } from '@/services/mediaService';

export type { UploadResponse };

export const useMediaUpload = () => {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      return await mediaService.upload(file, folder);
    },
  });
};

export const useDeleteMedia = () => {
  return useMutation({
    mutationFn: async (path: string) => {
      await mediaService.delete(path);
    },
  });
};

export const useDeleteProductMedia = () => {
  return useMutation({
    mutationFn: async (mediaId: string) => {
      await mediaService.deleteProductMedia(mediaId);
    },
  });
};
