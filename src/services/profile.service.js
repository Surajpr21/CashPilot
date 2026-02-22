import { supabase } from "../lib/supabaseClient";

const PROFILE_FIELDS = ["full_name", "avatar_url", "theme", "two_factor_enabled"];
const FINANCIAL_FIELDS = ["onboarding_completed", "opening_balance", "monthly_income", "tracking_start_date"];
const PROFILE_SELECT = "id, full_name, avatar_url, theme, two_factor_enabled";
const FINANCIAL_SELECT = "onboarding_completed, opening_balance, monthly_income, tracking_start_date";

function pickAllowed(updates, allowed) {
  return Object.entries(updates || {}).reduce((acc, [key, value]) => {
    if (allowed.includes(key)) acc[key] = value;
    return acc;
  }, {});
}

export async function getProfile(userId) {
  const profilePromise = supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  const financialPromise = supabase
    .from("financial_settings")
    .select(FINANCIAL_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  const [profileResult, financialResult] = await Promise.all([profilePromise, financialPromise]);

  const profileError = profileResult.error;
  const financialError = financialResult.error;

  if (profileError && profileError?.code !== "PGRST116") throw profileError;
  if (financialError && financialError?.code !== "PGRST116") throw financialError;

  const profileData = profileResult.data ?? null;
  const financialData = financialResult.data ?? null;

  if (!profileData && !financialData) return null;

  return {
    id: profileData?.id ?? userId,
    full_name: profileData?.full_name ?? null,
    avatar_url: profileData?.avatar_url ?? null,
    theme: profileData?.theme ?? null,
    two_factor_enabled: !!profileData?.two_factor_enabled,
    onboarding_completed: financialData?.onboarding_completed ?? false,
    opening_balance: financialData?.opening_balance ?? null,
    monthly_income: financialData?.monthly_income ?? null,
    tracking_start_date: financialData?.tracking_start_date ?? null,
  };
}

export async function saveProfile(userId, updates) {
  const profileUpdates = pickAllowed(updates, PROFILE_FIELDS);
  const financialUpdates = pickAllowed(updates, FINANCIAL_FIELDS);

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (error) throw error;
  }

  if (Object.keys(financialUpdates).length > 0) {
    const { error } = await supabase
      .from("financial_settings")
      .update(financialUpdates)
      .eq("user_id", userId);

    if (error) throw error;
  }

  const refreshed = await getProfile(userId);

  if (!refreshed) {
    throw new Error("Profile record not found. Please ensure a profile row exists for this user.");
  }

  return refreshed;
}
