import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  walletApi,
} from "@/api/wallet.api";

export const useWallet = () => {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: walletApi.getWallet,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useDepositMutation = () => {
  return useMutation({
    mutationFn: (amount: number) => walletApi.initializeDeposit(amount),
  });
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      amount: number;
      bank_code: string;
      account_number: string;
      account_name: string;
    }) => walletApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
    },
  });
};

export const useTransactions = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["wallet", "transactions", page, limit],
    queryFn: () => walletApi.getTransactionHistory(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

export const useBanks = () => {
  return useQuery({
    queryKey: ["wallet", "banks"],
    queryFn: walletApi.getBankList,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useVerifyAccountMutation = () => {
  return useMutation({
    mutationFn: ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) => 
      walletApi.verifyBankAccount(accountNumber, bankCode),
  });
};
