import axiosInstance from "./axiosInstance";

export interface ReferralUser {
  id: string;
  username: string;
}

export interface ReferralRecord {
  id: string;
  status: string;
  created_at: string;
  referred_id: string;
  users: ReferralUser;
}

export interface ReferralMilestone {
  target: number;
  remaining: number;
  pza_reward: number;
}

export interface ReferralStatsData {
  referral_code: string;
  total_referrals: number;
  verified_referrals: number;
  referrals: ReferralRecord[];
  next_milestone: ReferralMilestone | null;
}

export const getReferralStatsApi = async (): Promise<ReferralStatsData> => {
  console.log("[ReferralAPI] Fetching stats...");
  const { data } = await axiosInstance.get(`/referral/stats`);
  console.log("[ReferralAPI] Stats received:", data.data);
  return data.data;
};

export const validateReferralCodeApi = async (code: string) => {
  const { data } = await axiosInstance.get(`/referral/validate/${code}`);
  return data.data;
};
