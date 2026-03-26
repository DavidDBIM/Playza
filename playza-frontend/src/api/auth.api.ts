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
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    user: {
      id: string;
      email: string;
      username: string;
      phone: string;
      referral_code: string;
    };
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

export interface SigninPayload {
  identifier: string;
  password: string;
}

export interface SigninResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      username: string;
      phone: string;
      referral_code: string;
      is_email_verified: boolean;
      psa_points: number;
      avatar_url?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
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

export const signinApi = async (
  payload: SigninPayload,
): Promise<SigninResponse> => {
  const { data } = await axiosInstance.post<SigninResponse>(
    "/auth/signin",
    payload,
  );
  return data;
};

export const forgotPasswordApi = async (
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosInstance.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload,
  );
  return data;
};
