import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimStreakApi } from "../../api/loyalty.api";

export const useClaimStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimStreakApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", "me"] });
    },
  });
};
