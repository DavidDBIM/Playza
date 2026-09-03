import axiosInstance from "./axiosInstance";

export interface BannerData {
  id: string;
  title?: string;
  content?: string;
  image_url: string;
  link_url?: string;
  type: string;
}

// A single admin-sent notification as returned by the feed endpoint —
// covers all 6 admin types, not just the banner-eligible ones.
export interface NotificationItem {
  id: string;
  title?: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  type: string;
  priority?: string;
  audience?: string;
  status: string;
  created_at: string;
}

export interface RegisterPushPayload {
  token: string;
  deviceType: string;
}

export const getActiveBannerApi = async (): Promise<BannerData | null> => {
  const { data } = await axiosInstance.get(`/notifications/banner`);
  return data.data;
};

export const getNotificationsFeedApi = async (limit = 20): Promise<NotificationItem[]> => {
  const { data } = await axiosInstance.get(`/notifications/feed`, { params: { limit } });
  return data.data;
};

export const registerPushTokenApi = async (payload: RegisterPushPayload): Promise<void> => {
  await axiosInstance.post(`/notifications/register`, payload);
};