import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../../api/users.api";
import { TokenStorage } from "../../api/axiosInstance";

export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
    enabled: !!TokenStorage.getAccessToken(),
  });
};
