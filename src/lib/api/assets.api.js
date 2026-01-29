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

export async function getMetalSummary() {
  const { data, error } = await supabase
    .from("v_metal_summary")
    .select("metal_type, total_grams, avg_buy_price")
    .order("metal_type", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getInsuranceSummary() {
  const { data, error } = await supabase
    .from("v_insurance_summary")
    .select("policies_covered, total_premiums")
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Mutations — entry flows live outside the Assets dashboard.

export async function addInvestment(payload) {
  const { error } = await supabase.from("investments").insert(payload);
  if (error) throw error;
}

export async function getInvestmentsDetails() {
  const { data, error } = await supabase
    .from("v_investments_details")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateInvestment(investmentId, payload) {
  const { error } = await supabase
    .from("investments")
    .update(payload)
    .eq("id", investmentId);

  if (error) throw error;
}

export async function softDeleteInvestment(id) {
  const { error } = await supabase
    .from("investments")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw error;
}

export async function addMetalHolding(payload) {
  // Explicitly build payload to avoid leaking optional fields (e.g., currency)
  const insertPayload = {
    metal_type: payload?.metal_type,
    grams: payload?.grams,
    buy_price_per_gram:
      payload?.buy_price_per_gram === undefined ? null : payload?.buy_price_per_gram,
    purchased_at: payload?.purchased_at,
  };

  console.log("METAL INSERT PAYLOAD", insertPayload);

  const { error } = await supabase.from("metal_holdings").insert(insertPayload);
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

export async function getInsurancePoliciesSummary() {
  const { data, error } = await supabase
    .from("v_insurance_policies_summary")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateInsurancePolicy(policyId, payload) {
  const { error } = await supabase
    .from("insurance_policies")
    .update(payload)
    .eq("id", policyId);

  if (error) throw error;
}

export async function softDeleteInsurancePolicy(policyId) {
  const { error } = await supabase
    .from("insurance_policies")
    .update({ is_deleted: true })
    .eq("id", policyId);

  if (error) throw error;
}
