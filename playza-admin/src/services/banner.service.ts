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
    const response = await apiClient.get('/banners');
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

  // Upload image and get back a URL
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/banners/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.url || response.data?.data?.url;
  },
};
