import { supabase } from "../lib/supabaseClient";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, onboarding_completed, opening_balance, monthly_income, tracking_start_date"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error?.code === "PGRST116") return null; // row missing
    throw error;
  }

  return data ?? null;
}

export async function saveProfile(userId, updates) {
  const { data, error, count } = await supabase
    .from("profiles")
    .update({ ...updates })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Profile record not found. Please ensure a profile row exists for this user.");
  }
  return data;
}
