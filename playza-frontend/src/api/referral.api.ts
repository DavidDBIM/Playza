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

export interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface ReferralStatsData {
  referral_code: string;
  total_referrals: number;
  verified_referrals: number;
  referrals: ReferralRecord[];
  next_milestone: ReferralMilestone | null;
  pending_za: number;
  total_za_earned: number;
}

export const getReferralStatsApi = async (): Promise<ReferralStatsData> => {
  console.log("[ReferralAPI] Fetching stats...");
  const { data } = await axiosInstance.get(`/referral/stats`);
  return data.data;
};

export const validateReferralCodeApi = async (code: string) => {
  const { data } = await axiosInstance.get(`/referral/validate/${code}`);
  return data.data;
};

export const requestReferralPayoutApi = async (): Promise<PayoutRequest> => {
  const { data } = await axiosInstance.post(`/referral/request-payout`);
  return data.data;
};

export const getUserPayoutRequestsApi = async (): Promise<PayoutRequest[]> => {
  const { data } = await axiosInstance.get(`/referral/payout-requests`);
  return data.data;
};
