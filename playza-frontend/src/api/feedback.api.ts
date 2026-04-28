import axiosInstance from "./axiosInstance";

export interface FeedbackPayload {
  type: string;
  title: string;
  message: string;
  game_name?: string;
}

export interface FeedbackResponse {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  game_name?: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
}

export const submitFeedbackApi = async (payload: FeedbackPayload): Promise<FeedbackResponse> => {
  const { data } = await axiosInstance.post(`/feedback`, payload);
  return data.data;
};
