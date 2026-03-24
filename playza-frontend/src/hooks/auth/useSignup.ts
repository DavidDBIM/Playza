import { useMutation } from "@tanstack/react-query";
import { signupApi, type SignupPayload } from "../../api/auth.api";

export const useSignup = () => {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupApi(payload),
  });
};
