import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";
import { getMeApi } from "@/api/users.api";
import { logoutApi } from "@/api/auth.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TokenStorage } from "@/api/axiosInstance";
import {
  getProfileApi,
  getBankAccountsApi,
} from "@/api/profile.api";
import { walletApi } from "@/api/wallet.api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(
    TokenStorage.getAccessToken()
  );
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

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
        is_active: profile.is_active,
      });

      const timer = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ["wallet", "balance"],
          queryFn: walletApi.getWallet,
          staleTime: 2 * 60 * 1000,
        });
        setTimeout(() => {
          queryClient.prefetchQuery({
            queryKey: ["profile"],
            queryFn: getProfileApi,
            staleTime: 5 * 60 * 1000,
          });
          queryClient.prefetchQuery({
            queryKey: ["profile", "bank-accounts"],
            queryFn: getBankAccountsApi,
            staleTime: 5 * 60 * 1000,
          });
          queryClient.prefetchQuery({
            queryKey: ["wallet", "banks"],
            queryFn: walletApi.getBankList,
            staleTime: 60 * 60 * 1000,
          });
        }, 3000);
      }, 800);

      return () => clearTimeout(timer);
    } else if (isError) {
      setUser(null);
      setToken(null);
      TokenStorage.clearTokens();
      queryClient.clear();
    }
  }, [profile, isError, queryClient]);

  const setAuth = useCallback(
    (newUser: UserProfile, accessToken: string, refreshToken: string) => {
      TokenStorage.setTokens(accessToken, refreshToken);
      setToken(accessToken);
      setUser(newUser);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Best-effort logout
    } finally {
      TokenStorage.clearTokens();
      setToken(null);
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const isProfileComplete = useMemo(
    () => !!(user?.firstName && user?.lastName),
    [user]
  );

  const authLoading = isLoading || (!!token && !isError && !user);

  const value = useMemo(
    () => ({
      user,
      setAuth,
      logout,
      updateProfile,
      isProfileComplete,
      isLoading: authLoading,
    }),
    [user, isProfileComplete, authLoading, setAuth, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};