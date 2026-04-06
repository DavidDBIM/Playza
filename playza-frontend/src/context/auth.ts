import { createContext, useContext } from "react";

export interface Wallet {
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  referralCode: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  pzaPoints?: number;
  isEmailVerified?: boolean;
  createdAt?: string;
  wallet?: Wallet;
  show_activity?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  setAuth: (user: UserProfile, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  isProfileComplete: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
