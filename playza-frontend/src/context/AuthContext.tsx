import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";
import { getMeApi } from "@/api/users.api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("playza_token");
      if (token) {
        try {
          const profile = await getMeApi();

          setUser({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            referralCode: profile.referral_code || "",
            firstName: profile.first_name,
            lastName: profile.last_name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            pzaPoints: profile.wallet?.balance || 0,
            wallet: profile.wallet,
            isEmailVerified: profile.is_email_verified,
            show_activity: profile.show_activity,
          });
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("playza_token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const setAuth = useCallback((newUser: UserProfile, token: string) => {
    localStorage.setItem("playza_token", token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("playza_token");
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const isProfileComplete = useMemo(() => !!(user?.firstName && user?.lastName), [user]);

  const value = useMemo(() => ({
    user,
    setAuth,
    logout,
    updateProfile,
    isProfileComplete,
    isLoading,
  }), [user, isProfileComplete, isLoading, setAuth, logout, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
