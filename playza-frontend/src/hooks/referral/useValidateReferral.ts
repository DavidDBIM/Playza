import { useQuery } from "@tanstack/react-query";
import { validateReferralCodeApi } from "../../api/referral.api";

export const useValidateReferral = (code: string) => {
  return useQuery({
    queryKey: ["referral", "validate", code],
    queryFn: () => validateReferralCodeApi(code),
    enabled: !!code && code.length >= 6,
    retry: false,
    staleTime: 60000,
  });
};
