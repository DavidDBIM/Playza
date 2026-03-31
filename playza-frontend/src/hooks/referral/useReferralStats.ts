import { useQuery } from "@tanstack/react-query";
import { getReferralStatsApi } from "../../api/referral.api";

export const useReferralStats = () => {
  return useQuery({
    queryKey: ["referral", "stats"],
    queryFn: getReferralStatsApi,
  });
};
