import { supabase } from "../lib/supabaseClient";

export async function getActualSpendByCategory(from, to) {
  const { data, error } = await supabase
    .from("expenses")
    .select("category, amount, spent_at")
    .gte("spent_at", from)
    .lte("spent_at", to);

  if (error) throw error;

  // aggregate
  return data.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
}
