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
  is_active?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  // No longer takes a token — the backend sets it as an httpOnly cookie.
  // This just updates the in-memory user state after a successful signin/OTP verify.
  setAuth: (user: UserProfile) => void;
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
