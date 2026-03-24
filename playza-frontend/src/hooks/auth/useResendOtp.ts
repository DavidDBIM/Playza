import { useMutation } from "@tanstack/react-query";
import { resendOtpApi, type ResendOtpPayload } from "../../api/auth.api";

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => resendOtpApi(payload),
  });
};
