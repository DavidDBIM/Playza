import { useMutation } from "@tanstack/react-query";
import {
  forgotPasswordApi,
  type ForgotPasswordPayload,
  type ForgotPasswordResponse,
} from "../../api/auth.api";

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordPayload>({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(payload),
  });
};
