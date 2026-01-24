import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { signIn as signInService, signOut as signOutService } from "../services/auth.service";
import { getProfile, saveProfile } from "../services/profile.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    setProfileLoading(true);
    setError(null);
    try {
      const nextProfile = await getProfile(userId);
      if (nextProfile) {
        setProfile(nextProfile);
        return nextProfile;
      }

      const bootstrapProfile = {
        id: userId,
        onboarding_completed: false,
        opening_balance: null,
        monthly_income: null,
        tracking_start_date: null,
      };
      setProfile(bootstrapProfile);
      return bootstrapProfile;
    } catch (err) {
      setError(err?.message || "Failed to load profile");
      setProfile(null);
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

      setSession(nextSession);
      if (nextSession?.user?.id) {
        await fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setInitializing(false);
    }

    hydrate();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
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
  }, []);

  const persistProfile = useCallback(async (updates) => {
    if (!session?.user?.id) throw new Error("No active session");
    const nextProfile = await saveProfile(session.user.id, updates);
    setProfile(nextProfile);
    return nextProfile;
  }, [session]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return null;
    return fetchProfile(session.user.id);
  }, [fetchProfile, session]);

  const value = useMemo(
    () => ({
      session,
      profile,
      initializing,
      profileLoading,
      error,
      login,
      logout,
      persistProfile,
      refreshProfile,
      setProfile,
    }),
    [session, profile, initializing, profileLoading, error, login, logout, persistProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
