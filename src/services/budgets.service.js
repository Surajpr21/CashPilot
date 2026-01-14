import { supabase } from "../lib/supabaseClient";

/**
 * Get budgets for a specific month
 * month must be first day of month: YYYY-MM-01
 */
export async function getBudgetsByMonth(month) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("budgets")
    .select("id, category, amount, month")
    .eq("month", month)
    .eq("user_id", user?.id);

  if (error) throw error;
  return data;
}

/**
 * Add a new budget
 * user_id is auto-attached by Supabase auth
 */
export async function addBudget({ category, month, amount }) {
  const { data, error } = await supabase
    .from("budgets")
    .insert([{ category, month, amount }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Insert budget without sending user_id using RPC.
 * Requires SQL function on Supabase:
 *
 * CREATE OR REPLACE FUNCTION add_budget_rpc(p_category text, p_month date, p_amount numeric)
 * RETURNS budgets AS $$
 *   INSERT INTO budgets (category, month, amount, user_id)
 *   VALUES (p_category, p_month, p_amount, auth.uid())
 *   RETURNING *;
 * $$ LANGUAGE sql SECURITY DEFINER;
 */
export async function addBudgetRPC({ category, month, amount }) {
  const { data, error } = await supabase.rpc("add_budget_rpc", {
    p_category: category,
    p_month: month,
    p_amount: amount,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update budget amount only
 */
export async function updateBudgetAmount(id, amount) {
  const { data, error } = await supabase
    .from("budgets")
    .update({ amount })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
