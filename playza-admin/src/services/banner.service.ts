import { apiClient } from '../lib/api-client';

export interface BannerSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  color: string;
  accent: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BannerSlideInput {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  color: string;
  accent: string;
  is_active: boolean;
  sort_order: number;
}

export const bannerService = {
  async getAllSlides(): Promise<BannerSlide[]> {
    const response = await apiClient.get('/banners?all=true');
    return response.data?.data || response.data || [];
  },

  async createSlide(data: BannerSlideInput): Promise<BannerSlide> {
    const response = await apiClient.post('/banners', data);
    return response.data?.data || response.data;
  },

  async updateSlide(id: string, data: Partial<BannerSlideInput>): Promise<BannerSlide> {
    const response = await apiClient.put(`/banners/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteSlide(id: string): Promise<void> {
    await apiClient.delete(`/banners/${id}`);
  },

  async reorderSlides(ids: string[]): Promise<void> {
    await apiClient.post('/banners/reorder', { ids });
  },

  // Convert file → base64 and upload (no multer dependency on backend)
  async uploadImage(file: File): Promise<string> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await apiClient.post('/banners/upload', {
      base64,
      filename: file.name,
      mimeType: file.type,
    });

    return response.data?.url;
  },
};
