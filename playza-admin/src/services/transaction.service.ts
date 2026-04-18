import { apiClient } from "../lib/api-client";
import type { 
  TransactionAdmin, 
  PaginatedResponse 
} from "../types/admin";

export const transactionService = {
  getTransactions: async (params: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string; 
    search?: string;
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<TransactionAdmin, "transactions">>(
      "/admin/transactions", 
      { params }
    );
    return data.data;
  },

  getTransactionDetails: async (transactionId: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: TransactionAdmin }>(
      `/admin/transactions/${transactionId}`
    );
    return data.data;
  },
};
