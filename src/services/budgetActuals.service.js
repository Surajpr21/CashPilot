import { supabase } from "../lib/supabaseClient";

export async function getActualSpendByCategory(from, to, userId) {
  let query = supabase
    .from("expenses")
    .select("category, amount, spent_at")
    .gte("spent_at", from)
    .lte("spent_at", to);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).reduce((acc, e) => {
    const key = e.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
}
