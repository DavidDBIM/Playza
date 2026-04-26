import axiosInstance from "./axiosInstance";

export interface BannerData {
  id: string;
  title?: string;
  content?: string;
  image_url: string;
  link_url?: string;
  type: string;
}

export interface RegisterPushPayload {
  token: string;
  deviceType: string;
}

export const getActiveBannerApi = async (): Promise<BannerData | null> => {
  const { data } = await axiosInstance.get(`/notifications/banner`);
  return data.data;
};

export const registerPushTokenApi = async (payload: RegisterPushPayload): Promise<void> => {
  await axiosInstance.post(`/notifications/register`, payload);
};
