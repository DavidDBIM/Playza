import { useQuery } from "@tanstack/react-query";
import { getAmbassadorStatusApi } from "../../api/loyalty.api";

export const useAmbassadorStatus = () => {
  return useQuery({
    queryKey: ["loyalty", "ambassador", "status"],
    queryFn: getAmbassadorStatusApi,
    staleTime: 5 * 60 * 1000, // 5 mins
    retry: false,
  });
};
