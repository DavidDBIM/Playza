import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";
import { getMeApi } from "@/api/users.api";
import { logoutApi } from "@/api/auth.api";
import { TokenStorage } from "@/api/axiosInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, getBankAccountsApi } from "@/api/profile.api";
import { walletApi } from "@/api/wallet.api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const token = TokenStorage.getAccessToken();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync user state with query data
  useEffect(() => {
    if (profile) {
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

      // Background prefetch commonly-accessed data on sign-in
      // so those pages load instantly with no skeleton flicker
      queryClient.prefetchQuery({
        queryKey: ["profile"],
        queryFn: getProfileApi,
        staleTime: 5 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["wallet", "balance"],
        queryFn: walletApi.getWallet,
        staleTime: 2 * 60 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: ["profile", "bank-accounts"],
        queryFn: getBankAccountsApi,
        staleTime: 5 * 60 * 1000,
      });
    } else if (isError) {
      TokenStorage.clearTokens();
      setUser(null);
    }
  }, [profile, isError, queryClient]);

  /**
   * Persists both the access token and refresh token, then updates the user state.
   * The refresh token is needed so axiosInstance can silently renew the session.
   */
  const setAuth = useCallback(
    (newUser: UserProfile, token: string, refreshToken?: string) => {
      if (refreshToken) {
        TokenStorage.setTokens(token, refreshToken);
      } else {
        localStorage.setItem("playza_token", token);
      }
      setUser(newUser);
    },
    [],
  );

  /**
   * Calls the backend logout endpoint (best‑effort) to invalidate the Supabase
   * session server‑side, then always clears local storage and user state.
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Non-critical — local cleanup always runs
      console.warn("[Auth] Backend logout call failed:", err);
    } finally {
      TokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const isProfileComplete = useMemo(() => !!(user?.firstName && user?.lastName), [user]);

  const value = useMemo(
    () => ({
      user,
      setAuth,
      logout,
      updateProfile,
      isProfileComplete,
      isLoading,
    }),
    [user, isProfileComplete, isLoading, setAuth, logout, updateProfile],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
