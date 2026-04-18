import { useQuery } from "@tanstack/react-query";
import { transactionService } from "../services/transaction.service";

export const useAdminTransactions = (params: { 
  page?: number; 
  limit?: number; 
  type?: string; 
  status?: string; 
  search?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "transactions", params],
    queryFn: () => transactionService.getTransactions(params),
  });
};

export const useAdminTransactionDetails = (transactionId: string) => {
  return useQuery({
    queryKey: ["admin", "transactions", transactionId],
    queryFn: () => transactionService.getTransactionDetails(transactionId),
    enabled: !!transactionId,
  });
};
