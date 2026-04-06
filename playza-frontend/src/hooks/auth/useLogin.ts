import { useMutation } from "@tanstack/react-query";
import { signinApi, type SigninPayload, type SigninResponse } from "../../api/auth.api";

export const useLogin = () => {
  return useMutation<SigninResponse, Error, SigninPayload>({
    mutationFn: (payload: SigninPayload) => signinApi(payload),
    // Token persistence is handled by setAuth in LogIn.tsx via TokenStorage
  });
};
