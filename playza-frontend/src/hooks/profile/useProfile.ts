import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfileApi,
  updateProfileApi,
  getGameHistoryApi,
  getBankAccountsApi,
  addBankAccountApi,
  setPrimaryBankAccountApi,
  removeBankAccountApi,
} from "../../api/profile.api";
import type { UpdateProfilePayload } from "../../api/profile.api";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfileApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};

export const useGameHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["profile", "history", page, limit],
    queryFn: () => getGameHistoryApi(page, limit),
  });
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ["profile", "bank-accounts"],
    queryFn: getBankAccountsApi,
  });
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBankAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useSetPrimaryBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPrimaryBankAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useRemoveBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBankAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
