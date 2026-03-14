import { api } from './api-client';

export interface UploadImageResponse {
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export const uploadsApi = {
  async uploadImage(
    token: string,
    base64: string,
    filename = 'image.png'
  ): Promise<UploadImageResponse> {
    return api.post('/uploads/image', { base64, filename }, token);
  },
};
