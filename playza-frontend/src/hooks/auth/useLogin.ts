import { useMutation } from "@tanstack/react-query";
import { signinApi, type SigninPayload, type SigninResponse } from "../../api/auth.api";

export const useLogin = () => {
  return useMutation<SigninResponse, Error, SigninPayload>({
    mutationFn: (payload: SigninPayload) => signinApi(payload),
    onSuccess: (data) => {
      // Persist the JWT so axiosInstance will attach it on every request
      const token = data.data.session.access_token;
      localStorage.setItem("playza_token", token);
    },
  });
};
