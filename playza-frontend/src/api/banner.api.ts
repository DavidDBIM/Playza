import axiosInstance from './axiosInstance';

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
}

export const getBannerSlides = async (): Promise<BannerSlide[]> => {
  const response = await axiosInstance.get('/banners');
  return response.data?.data || response.data || [];
};
