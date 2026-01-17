// Media Service
import { api } from '@/lib/api';

export interface UploadResponse {
    url: string;
    path: string;
    filename: string;
    original_name: string;
    size: number;
    mime_type: string;
}

export const mediaService = {
    async upload(file: File, folder?: string): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
            formData.append('folder', folder);
        }
        return api.post('/admin/media/upload', formData);
    },

    async delete(path: string): Promise<{ message: string }> {
        return api.delete('/admin/media');
    },

    async deleteProductMedia(mediaId: string): Promise<{ message: string }> {
        return api.delete(`/admin/media/${mediaId}`);
    },
};
