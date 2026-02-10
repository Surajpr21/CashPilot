import { supabase } from "../lib/supabaseClient";

export async function getTwoFactorStatus() {
  const { data, error } = await supabase.rpc("get_two_factor_status");
  if (error) {
    console.error("getTwoFactorStatus", error);
    return false;
  }
  return !!data;
}

export async function enableTwoFactor() {
  const { data, error } = await supabase.rpc("enable_two_factor");
  if (error) throw error;
  return !!data;
}

export async function disableTwoFactor() {
  const { data, error } = await supabase.rpc("disable_two_factor");
  if (error) throw error;
  return !!data;
}
