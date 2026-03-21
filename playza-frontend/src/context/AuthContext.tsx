import { useState, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Mock initial user
  const [user, setUser] = useState<UserProfile | null>({
    username: "AnthonyGamer",
    email: "anthony@playza.gg",
    phoneNumber: "08012345678",
    // firstName and lastName are missing by default to test the flow
  });

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const isProfileComplete = !!(user?.firstName && user?.lastName);

  return (
    <AuthContext.Provider value={{ user, updateProfile, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

