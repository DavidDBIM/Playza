import { createContext, useContext } from "react";

export interface UserProfile {
  username: string;
  email: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  updateProfile: (data: Partial<UserProfile>) => void;
  isProfileComplete: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
