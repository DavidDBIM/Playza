import { apiClient } from "../lib/api-client";

export interface NotificationPayload {
  title?: string;
  content?: string;
  image_url?: string;
  type: string;
  priority: string;
  audience: string;
  link_url?: string;
}

export interface Notification extends NotificationPayload {
  id: string;
  status: string;
  created_at: string;
}

export const notificationService = {
  sendNotification: async (payload: NotificationPayload) => {
    const { data } = await apiClient.post<{ success: boolean; data: Notification }>(
      "/admin/notifications",
      payload
    );
    return data.data;
  },

  getHistory: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get<{ 
      success: boolean; 
      data: {
        notifications: Notification[];
        total: number;
        page: number;
        total_pages: number;
      } 
    }>("/admin/notifications", { params: { page, limit } });
    return data.data;
  },

  deleteNotification: async (id: string) => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/admin/notifications/${id}`);
    return data;
  }
};
