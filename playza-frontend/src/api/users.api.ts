import axiosInstance from "./axiosInstance";

export interface Wallet {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_email_verified: boolean;
  pza_points: number;
  referral_code: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
  show_activity?: boolean;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export const getMeApi = async (): Promise<User> => {
  const { data } = await axiosInstance.get(`/users/me`);
  return data.data;
};

export const updateMeApi = async (
  payload: UpdateUserPayload,
): Promise<User> => {
  const { data } = await axiosInstance.patch(`/users/me`, payload);
  return data.data;
};

export const deactivateUserApi = async (userId: string): Promise<void> => {
  await axiosInstance.patch(`/users/${userId}/deactivate`);
};
