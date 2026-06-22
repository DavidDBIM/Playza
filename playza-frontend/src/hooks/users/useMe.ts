import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "../../api/users.api";

// Auth lives in an httpOnly cookie now — can't check "is there a token" from
// JS, so we just attempt the call. A 401 means logged out, which is normal.
export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
    retry: false,
  });
};
