import axiosInstance from "./axiosInstance";

export interface BankAccount {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_primary: boolean;
}

export interface Wallet {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  referral_code: string;
  is_email_verified: boolean;
  created_at: string;
  tagline?: string;
  bio?: string;
  show_activity: boolean;
  pza_points: number;
  wallet: Wallet;
  bank_accounts: BankAccount[];
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  tagline?: string;
  bio?: string;
  show_activity?: boolean;
}

export interface GameHistoryItem {
  id: string;
  game_name: string;
  score: number;
  position: number;
  winnings: number;
  status: string;
  played_at: string;
}

export interface GameHistoryResponse {
  history: GameHistoryItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const getProfileApi = async (): Promise<Profile> => {
  const { data } = await axiosInstance.get(`/profile`);
  return data.data;
};

export const updateProfileApi = async (payload: UpdateProfilePayload): Promise<void> => {
  await axiosInstance.patch(`/profile`, payload);
};

export const getGameHistoryApi = async (page = 1, limit = 20): Promise<GameHistoryResponse> => {
  const { data } = await axiosInstance.get(`/profile/history`, { params: { page, limit } });
  return data.data;
};

export const getBankAccountsApi = async (): Promise<BankAccount[]> => {
  const { data } = await axiosInstance.get(`/profile/bank-accounts`);
  return data.data;
};

export const addBankAccountApi = async (payload: {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}): Promise<void> => {
  await axiosInstance.post(`/profile/bank-accounts`, payload);
};

export const setPrimaryBankAccountApi = async (accountId: string): Promise<void> => {
  await axiosInstance.patch(`/profile/bank-accounts/${accountId}/primary`);
};

export const removeBankAccountApi = async (accountId: string): Promise<void> => {
  await axiosInstance.delete(`/profile/bank-accounts/${accountId}`);
};
