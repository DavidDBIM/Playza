import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { AuthContext, type UserProfile } from "./auth";
import { getMeApi } from "@/api/users.api";
import { logoutApi } from "@/api/auth.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfileApi,
  getBankAccountsApi,
} from "@/api/profile.api";
import { walletApi } from "@/api/wallet.api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();

  // Auth now lives in an httpOnly cookie set by the backend — JS can't read
  // it, so we can't gate this query on "is there a token". Instead we always
  // attempt the /users/me call; the cookie rides along automatically via
  // axios's withCredentials. A 401 here just means "not logged in", which
  // is the expected, normal case for a logged-out visitor — not an error to
  // alarm about.
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeApi,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

      // Defer non-critical prefetches so they don't compete with the initial render
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
      // Not logged in (or session expired) — just clear local state.
      // No tokens to clear since they live in httpOnly cookies the backend manages.
      setUser(null);
      queryClient.clear();
    }
  }, [profile, isError, queryClient]);

  // Called after a successful signin or OTP verification. The backend has
  // already set the auth cookies in its response — this just updates the
  // in-memory user state so the UI reflects the logged-in user immediately
  // without waiting for the next /users/me refetch.
  const setAuth = useCallback((newUser: UserProfile) => {
    setUser(newUser);
    queryClient.invalidateQueries({ queryKey: ["users", "me"] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutApi(); // backend clears the httpOnly cookies
    } catch {
      // Best-effort logout
    } finally {
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const isProfileComplete = useMemo(
    () => !!(user?.firstName && user?.lastName),
    [user],
  );

  const authLoading = isLoading;

  const value = useMemo(
    () => ({
      user,
      setAuth,
      logout,
      updateProfile,
      isProfileComplete,
      isLoading: authLoading,
    }),
    [user, isProfileComplete, authLoading, setAuth, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
