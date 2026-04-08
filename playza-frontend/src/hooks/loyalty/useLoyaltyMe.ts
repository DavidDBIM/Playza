import { useQuery } from "@tanstack/react-query";
import { getLoyaltyMeApi } from "../../api/loyalty.api";

export const useLoyaltyMe = () => {
  return useQuery({
    queryKey: ["loyalty", "me"],
    queryFn: getLoyaltyMeApi,
    staleTime: 2 * 60 * 1000,
  });
};
