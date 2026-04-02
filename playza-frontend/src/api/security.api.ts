import axiosInstance from "./axiosInstance";

export interface PinStatus {
  has_pin: boolean;
}

export interface SecurityPreferences {
  match_alerts: boolean;
  marketing_emails: boolean;
  show_activity: boolean;
}

export const getPinStatusApi = async (): Promise<PinStatus> => {
  const { data } = await axiosInstance.get(`/security/pin/status`);
  return data.data;
};

export const createPinApi = async (pin: string): Promise<void> => {
  await axiosInstance.post(`/security/pin/create`, { pin });
};

export const changePinApi = async (old_pin: string, new_pin: string): Promise<void> => {
  await axiosInstance.post(`/security/pin/change`, { old_pin, new_pin });
};

export const verifyPinApi = async (pin: string): Promise<{ valid: boolean }> => {
  const { data } = await axiosInstance.post(`/security/pin/verify`, { pin });
  return data.data;
};

export const changePasswordApi = async (payload: { current_password: string; new_password: string }): Promise<void> => {
  await axiosInstance.post(`/security/password/change`, payload);
};

export const updateSecurityPreferencesApi = async (payload: Partial<SecurityPreferences>): Promise<void> => {
  await axiosInstance.patch(`/security/notifications`, payload);
};
