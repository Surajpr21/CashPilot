import { supabase } from "../supabaseClient";

export async function getAssetsSummary() {
  const { data, error } = await supabase
    .from("v_total_assets")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getInvestmentsTotal() {
  const { data, error } = await supabase
    .from("v_total_investments")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getGoldSummary() {
  const { data, error } = await supabase
    .from("v_gold_summary")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getInsuranceTotal() {
  const { data, error } = await supabase
    .from("v_insurance_total")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Mutations — entry flows live outside the Assets dashboard.

export async function addInvestment(payload) {
  const { error } = await supabase.from("investments").insert(payload);
  if (error) throw error;
}

export async function addGoldHolding(payload) {
  const { error } = await supabase.from("gold_holdings").insert(payload);
  if (error) throw error;
}

export async function addInsurancePremium(payload) {
  const { error } = await supabase.from("insurance_premiums").insert(payload);
  if (error) throw error;
}

export async function getInsurancePolicies() {
  const { data, error } = await supabase
    .from("insurance_policies")
    .select("id, provider, policy_name, insurance_type")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createInsurancePolicy(payload) {
  const { data, error } = await supabase
    .from("insurance_policies")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLatestGoldMarketPrice() {
  const { data, error } = await supabase
    .from("gold_market_prices")
    .select("price_per_gram, currency, price_date")
    .order("price_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function softDeleteInvestment(id) {
  const { error } = await supabase
    .from("investments")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw error;
}
