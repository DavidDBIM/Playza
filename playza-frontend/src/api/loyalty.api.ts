import axiosInstance from "./axiosInstance";

export interface PzaEvent {
  event_type: string;
  points_awarded: number;
  created_at: string;
}

export interface ClaimedTask {
  task_id: string;
  claimed_at: string;
}

export interface LoyaltyData {
  total_points: number;
  streak_days: number;
  last_claimed_at: string | null;
  can_claim_streak_today: boolean;
  recent_events: PzaEvent[];
  claimed_tasks: ClaimedTask[];
}

export const getLoyaltyMeApi = async (): Promise<LoyaltyData> => {
  const { data } = await axiosInstance.get(`/pza/me`);
  return data.data;
};

export const claimStreakApi = async () => {
  const { data } = await axiosInstance.post(`/pza/streak/claim`);
  return data.data;
};

export const claimTaskApi = async (taskId: string, points: number) => {
  const { data } = await axiosInstance.post(`/pza/task/claim`, { task_id: taskId, points });
  return data.data;
};
