import { useQuery } from "@tanstack/react-query";
import { getLoyaltyMeApi } from "../../api/loyalty.api";
import { TokenStorage } from "../../api/axiosInstance";

export const useLoyaltyMe = () => {
  return useQuery({
    queryKey: ["loyalty", "me"],
    queryFn: getLoyaltyMeApi,
    staleTime: 2 * 60 * 1000,
    enabled: !!TokenStorage.getAccessToken(),
  });
};
