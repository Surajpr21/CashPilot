import { supabase } from "../lib/supabaseClient";

export async function addExpense(expense) {
  const {
    spent_at,
    title,
    category,
    sub_category,
    amount,
    payment_mode,
    user_id,
  } = expense;

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        user_id,
        spent_at,
        title,
        category,
        sub_category,
        amount,
        payment_mode,
      }
    ]);

  return { data, error };
}

// Aggregate expense stats between optional dates.
export async function getExpenseStats(fromDate, toDate) {
  let query = supabase.from("expenses").select("amount, spent_at");

  if (fromDate) query = query.gte("spent_at", fromDate);
  if (toDate) query = query.lte("spent_at", toDate);

  const { data, error } = await query;
  if (error) return { data: null, error };

  const total = data.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const days = new Set(data.map((e) => e.spent_at)).size;

  return {
    data: {
      total_spent: total,
      avg_per_day: days ? total / days : 0,
      transactions: data.length,
    },
    error: null,
  };
}

export async function getExpenses({ fromDate, toDate } = {}) {
  console.log("SERVICE RANGE =>", fromDate, toDate);

  let query = supabase
    .from("expenses")
    .select("*")
    .order("spent_at", { ascending: false });

  if (fromDate) query = query.gte("spent_at", fromDate);
  if (toDate) query = query.lte("spent_at", toDate);

  const { data, error } = await query;

  console.log("RESULT ROWS =>", data?.length);

  return { data, error };
}

export function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = `${year}-${String(month).padStart(2, "0")}-31`;
  return { from, to };
}

export async function getExpensesForMonth(year, month) {
  const { from, to } = getMonthRange(year, month);
  // TEMP FIX: Disable date filter to confirm data exists
  return await getExpenses(); // no date filter
  // return await getExpenses({ fromDate: from, toDate: to });
}
