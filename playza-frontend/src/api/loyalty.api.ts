import axiosInstance from "./axiosInstance";

export interface PzaEvent {
  event_type: string;
  points_awarded: number;
  created_at: string;
}

export interface LoyaltyData {
  total_points: number;
  streak_days: number;
  recent_events: PzaEvent[];
}

export const getLoyaltyMeApi = async (): Promise<LoyaltyData> => {
  console.log("[LoyaltyAPI] Fetching loyalty data...");
  const { data } = await axiosInstance.get(`/pza/me`);
  console.log("[LoyaltyAPI] Data received:", data.data);
  return data.data;
};
