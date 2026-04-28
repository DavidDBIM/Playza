import { apiClient } from "../lib/api-client";

export interface FeedbackAdminItem {
  id: string;
  type: string;
  title: string;
  message: string;
  game_name?: string;
  is_read: boolean;
  is_resolved: boolean;
  admin_note?: string;
  created_at: string;
  users: {
    username: string;
    email: string;
    avatar_url: string;
  };
}

export const feedbackService = {
  getAllFeedback: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: {
        feedback: FeedbackAdminItem[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }>("/admin/feedback", { params });
    return data.data;
  },

  updateFeedback: async (id: string, updates: {
    is_read?: boolean;
    is_resolved?: boolean;
    admin_note?: string;
  }) => {
    const { data } = await apiClient.patch<{
      success: boolean;
      data: FeedbackAdminItem;
    }>(`/admin/feedback/${id}`, updates);
    return data.data;
  },

  deleteFeedback: async (id: string) => {
    const { data } = await apiClient.delete<{
      success: boolean;
    }>(`/admin/feedback/${id}`);
    return data.success;
  }
};
