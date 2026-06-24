import { useQuery } from "@tanstack/react-query";
import { getAmbassadorStatusApi } from "../../api/loyalty.api";
import { TokenStorage } from "../../api/axiosInstance";

export const useAmbassadorStatus = () => {
  return useQuery({
    queryKey: ["loyalty", "ambassador", "status"],
    queryFn: getAmbassadorStatusApi,
    enabled: !!TokenStorage.getAccessToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};