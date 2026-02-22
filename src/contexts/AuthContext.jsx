import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { signIn as signInService, signOut as signOutService } from "../services/auth.service";
import { getProfile, saveProfile } from "../services/profile.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastUserIdRef = useRef(null);

  const fetchProfile = useCallback(async (userId) => {
    setProfileLoading(true);
    setError(null);
    try {
      // Pull the latest auth user so we can surface the registered email in profile UI
      const { data: authUserData } = await supabase.auth.getUser();
      const userEmail = authUserData?.user?.email ?? null;

      const account = await getProfile(userId);

      if (account) {
        const nextProfile = {
          id: account.id,
          full_name: account.full_name ?? null,
          avatar_url: account.avatar_url ?? null,
          theme: account.theme ?? null,
          email: userEmail,
          two_factor_enabled: !!account.two_factor_enabled,
        };
        const nextFinancial = {
          onboarding_completed: !!account.onboarding_completed,
          opening_balance: account.opening_balance ?? null,
          monthly_income: account.monthly_income ?? null,
          tracking_start_date: account.tracking_start_date ?? null,
        };
        setProfile(nextProfile);
        setFinancial(nextFinancial);
        return { profile: nextProfile, financial: nextFinancial };
      }

      const bootstrapProfile = {
        id: userId,
        full_name: null,
        avatar_url: null,
        theme: null,
        email: userEmail,
        two_factor_enabled: false,
      };
      const bootstrapFinancial = {
        onboarding_completed: false,
        opening_balance: null,
        monthly_income: null,
        tracking_start_date: null,
      };
      setProfile(bootstrapProfile);
      setFinancial(bootstrapFinancial);
      return { profile: bootstrapProfile, financial: bootstrapFinancial };
    } catch (err) {
      setError(err?.message || "Failed to load profile");
      setProfile(null);
      setFinancial(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      setInitializing(true);
      const { data } = await supabase.auth.getSession();
      const nextSession = data?.session ?? null;

      if (!active) return;

      const nextUserId = nextSession?.user?.id ?? null;
      lastUserIdRef.current = nextUserId;
      setSession(nextSession);
      if (nextUserId) {
        await fetchProfile(nextUserId);
      } else {
        setProfile(null);
        setFinancial(null);
      }
      setInitializing(false);
    }

    hydrate();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const nextUserId = newSession?.user?.id ?? null;
      const currentUserId = lastUserIdRef.current;

      if (nextUserId === currentUserId) {
        return;
      }

      lastUserIdRef.current = nextUserId;
      setSession(newSession);
      if (nextUserId) {
        fetchProfile(nextUserId);
      } else {
        setProfile(null);
        setFinancial(null);
      }
    });

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      const { data, error: signInError } = await signInService(email, password);
      if (signInError) return { error: signInError };

      const nextSession = data?.session ?? null;
      lastUserIdRef.current = nextSession?.user?.id ?? null;
      setSession(nextSession);

      if (nextSession?.user?.id) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        return { error: null, profile: nextProfile };
      }

      return { error: null, profile: null };
    },
    [fetchProfile]
  );

  const logout = useCallback(async () => {
    await signOutService();
    setSession(null);
    setProfile(null);
    setFinancial(null);
    lastUserIdRef.current = null;
  }, []);

  const persistProfile = useCallback(async (updates) => {
    if (!session?.user?.id) throw new Error("No active session");
    const next = await saveProfile(session.user.id, updates);

    const nextProfile = {
      id: next.id,
      full_name: next.full_name ?? null,
      avatar_url: next.avatar_url ?? null,
      theme: next.theme ?? null,
      two_factor_enabled: !!next.two_factor_enabled,
    };
    const nextFinancial = {
      onboarding_completed: !!next.onboarding_completed,
      opening_balance: next.opening_balance ?? null,
      monthly_income: next.monthly_income ?? null,
      tracking_start_date: next.tracking_start_date ?? null,
    };

    setProfile(nextProfile);
    setFinancial(nextFinancial);
    return { profile: nextProfile, financial: nextFinancial };
  }, [session]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return null;
    return fetchProfile(session.user.id);
  }, [fetchProfile, session]);

  const value = useMemo(
    () => ({
      session,
      profile,
      financial,
      initializing,
      profileLoading,
      error,
      login,
      logout,
      persistProfile,
      refreshProfile,
      setProfile,
      setFinancial,
    }),
    [session, profile, financial, initializing, profileLoading, error, login, logout, persistProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function useAuthUser() {
  const { session } = useAuth();
  return session?.user ?? null;
}
