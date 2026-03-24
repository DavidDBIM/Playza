import axiosInstance from "./axiosInstance";

// Types

export interface SignupPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
  };
}

export interface VerifyOtpPayload {
  email: string;
  token: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  data: {
    message: string;
    token?: string;
  };
}

export interface ResendOtpPayload {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// API Functions

export const signupApi = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  const { data } = await axiosInstance.post<SignupResponse>(
    "/auth/signup",
    payload,
  );
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> => {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    "/auth/verify-otp",
    payload,
  );
  return data;
};

export const resendOtpApi = async (
  payload: ResendOtpPayload,
): Promise<ResendOtpResponse> => {
  const { data } = await axiosInstance.post<ResendOtpResponse>(
    "/auth/resend-otp",
    payload,
  );
  return data;
};
