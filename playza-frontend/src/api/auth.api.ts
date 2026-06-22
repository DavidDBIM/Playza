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

// Tokens are now set as httpOnly cookies by the backend — no longer returned in JSON.
export interface VerifyOtpResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      phone: string;
      referral_code: string;
      is_email_verified: boolean;
      pza_points: number;
      avatar_url?: string;
      first_name?: string;
      last_name?: string;
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

// Tokens are now set as httpOnly cookies by the backend — no longer returned in JSON.
export interface SigninResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      phone: string;
      referral_code: string;
      is_email_verified: boolean;
      pza_points: number;
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

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
    };
  };
}

export interface LogoutResponse {
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

// No longer takes a refresh token param — it's read from the httpOnly
// cookie server-side. Kept as a function (no args) so axiosInstance's
// interceptor and any manual callers have one consistent way to refresh.
export const refreshTokenApi = async (): Promise<RefreshTokenResponse> => {
  const { data } = await axiosInstance.post<RefreshTokenResponse>(
    "/auth/refresh",
    {},
  );
  return data;
};

export const logoutApi = async (): Promise<LogoutResponse> => {
  const { data } = await axiosInstance.post<LogoutResponse>("/auth/logout");
  return data;
};

export interface ResetPasswordPayload {
  access_token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: { message: string };
}

export const resetPasswordApi = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const { data } = await axiosInstance.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload,
  );
  return data;
};
