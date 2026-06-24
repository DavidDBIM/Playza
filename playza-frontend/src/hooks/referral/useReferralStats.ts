import { useQuery } from "@tanstack/react-query";
import { getReferralStatsApi } from "../../api/referral.api";
import { TokenStorage } from "../../api/axiosInstance";

export const useReferralStats = () => {
  return useQuery({
    queryKey: ["referral", "stats"],
    queryFn: getReferralStatsApi,
    enabled: !!TokenStorage.getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
