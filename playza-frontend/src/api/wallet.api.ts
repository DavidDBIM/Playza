import axiosInstance from "./axiosInstance";

export interface WalletBalance {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund';
  amount: number;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  reference: string;
  created_at: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Bank {
  name: string;
  code: string;
}

export interface InitializeDepositResponse {
  authorization_url: string;
  reference: string;
  amount: number;
}

export const walletApi = {
  getWallet: async (): Promise<WalletBalance> => {
    const response = await axiosInstance.get("/wallet/balance");
    console.log("[WalletApi] getWallet response:", response.data);
    return response.data.data;
  },

  initializeDeposit: async (amount: number): Promise<InitializeDepositResponse> => {
    const response = await axiosInstance.post("/wallet/deposit/initialize", { amount });
    console.log("[WalletApi] initializeDeposit response:", response.data);
    return response.data.data;
  },

  verifyDeposit: async (reference: string) => {
    const response = await axiosInstance.get(`/wallet/deposit/verify/${reference}`);
    console.log("[WalletApi] verifyDeposit response:", response.data);
    return response.data.data;
  },

  requestWithdrawal: async (data: {
    amount: number;
    bank_code: string;
    account_number: string;
    account_name: string;
  }) => {
    const response = await axiosInstance.post("/wallet/withdraw", data);
    console.log("[WalletApi] requestWithdrawal response:", response.data);
    return response.data.data;
  },

  getTransactionHistory: async (page = 1, limit = 20): Promise<TransactionHistoryResponse> => {
    const response = await axiosInstance.get(`/wallet/transactions?page=${page}&limit=${limit}`);
    console.log("[WalletApi] getTransactionHistory response:", response.data);
    return response.data.data;
  },

  getBankList: async (): Promise<Bank[]> => {
    const response = await axiosInstance.get("/wallet/banks");
    console.log("[WalletApi] getBankList response:", response.data);
    return response.data.data;
  },

  verifyBankAccount: async (account_number: string, bank_code: string) => {
    const response = await axiosInstance.post("/wallet/verify-account", {
      account_number,
      bank_code,
    });
    console.log("[WalletApi] verifyBankAccount response:", response.data);
    return response.data.data;
  },
};
