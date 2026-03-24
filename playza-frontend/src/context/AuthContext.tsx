import { useState, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>({
    username: "AnthonyGamer",
    email: "anthony@playza.gg",
    phoneNumber: "08012345678",
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

