import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../../api/users.api";

export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
  });
};
