import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestReferralPayoutApi, getUserPayoutRequestsApi } from "../../api/referral.api";

export const useRequestReferralPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestReferralPayoutApi,
    onSuccess: () => {
      // Invalidate stats and payout requests to refresh data
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
      queryClient.invalidateQueries({ queryKey: ["referral-payout-requests"] });
    },
  });
};

export const useReferralPayoutRequests = () => {
  return useQuery({
    queryKey: ["referral-payout-requests"],
    queryFn: getUserPayoutRequestsApi,
  });
};
