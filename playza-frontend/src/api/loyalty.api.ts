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
  spins_left_today: number;
}

export interface SpinResult {
  points_won: number;
  points_spent: number;
  segment_index: number;
  label: string;
  new_balance: number;
  spins_left_today: number;
}

export interface AmbassadorStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  admin_note: string | null;
}

export interface AmbassadorApplyPayload {
  full_name: string;
  email: string;
  phone?: string;
  qualification_type: 'social_influencer' | 'gold_badge' | 'referral_100';
  platforms?: string[];
  follower_count?: number;
  social_handles?: Record<string, string>;
  content_niche?: string;
  motivation: string;
}

export interface SocialTaskConfig {
  id: string;
  platform: string;
  action_type: string;
  title: string;
  description: string;
  target_url: string;
  points: number;
}

export interface SocialSubmission {
  id: string;
  task_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  admin_note: string | null;
}

export const getLoyaltyMeApi = async (): Promise<LoyaltyData> => {
  const { data } = await axiosInstance.get(`/pza/me`);
  return data.data;
};

export const claimStreakApi = async () => {
  const { data } = await axiosInstance.post(`/pza/streak/claim`);
  return data.data;
};

export const claimTaskApi = async (taskId: string) => {
  const { data } = await axiosInstance.post(`/pza/task/claim`, { task_id: taskId });
  return data.data;
};

export const spinWheelApi = async (): Promise<SpinResult> => {
  const { data } = await axiosInstance.post(`/pza/spin`);
  return data.data;
};

export const getAmbassadorStatusApi = async (): Promise<AmbassadorStatus | null> => {
  const { data } = await axiosInstance.get(`/pza/ambassador/status`);
  return data.data;
};

export const applyAmbassadorApi = async (payload: AmbassadorApplyPayload) => {
  const { data } = await axiosInstance.post(`/pza/ambassador/apply`, payload);
  return data.data;
};

export const getSocialTaskConfigsApi = async (): Promise<SocialTaskConfig[]> => {
  const { data } = await axiosInstance.get(`/pza/social-task/configs`);
  return data.data;
};

export const getMySocialSubmissionsApi = async (): Promise<SocialSubmission[]> => {
  const { data } = await axiosInstance.get(`/pza/social-task/my-submissions`);
  return data.data;
};
