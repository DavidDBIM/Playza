import { useMutation } from "@tanstack/react-query";
import { verifyOtpApi, type VerifyOtpPayload } from "../../api/auth.api";

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpApi(payload),
  });
};
