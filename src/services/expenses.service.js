import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 10;

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

  if (!user_id) {
    throw new Error("Missing user id for expense");
  }

  const { data, error } = await supabase.from("expenses").insert({
    spent_at,
    title,
    category,
    sub_category,
    amount,
    payment_mode,
    user_id,
  });

  return { data, error };
}

// Aggregate expense stats between optional dates.
export async function getExpenseStats(fromDate, toDate, userId) {
  let query = supabase.from("expenses").select("amount, spent_at, user_id");

  if (userId) {
    query = query.eq("user_id", userId);
  }

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

export async function getExpenses({ fromDate, toDate, userId } = {}) {
  console.log("SERVICE RANGE =>", fromDate, toDate);

  let query = supabase
    .from("expenses")
    .select("*")
    .order("spent_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

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
  return await getExpenses({ fromDate: from, toDate: to });
}

export async function getRecentExpenses({ userId, limit = 5 } = {}) {
  let query = supabase
    .from("expenses")
    .select("id, title, category, sub_category, amount, spent_at, payment_mode, user_id")
    .order("spent_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data || [];
  return rows.map((row) => ({
    ...row,
    note: row.sub_category || row.title || "",
  }));
}

export async function getExpensesByMonth({ userId, months = 12 } = {}) {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1)
    .toISOString()
    .split("T")[0];

  let query = supabase
    .from("expenses")
    .select("amount, spent_at")
    .gte("spent_at", from)
    .order("spent_at", { ascending: true });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const monthsArr = Array.from({ length: months }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      value: 0,
    };
  });

  const map = monthsArr.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});

  (data || []).forEach((row) => {
    const key = row.spent_at.slice(0, 7);
    if (map[key]) {
      map[key].value += Number(row.amount || 0);
    }
  });

  return monthsArr;
}

export async function getTopCategories({ userId, days = 30 } = {}) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));
  const fromStr = from.toISOString().split("T")[0];

  let query = supabase
    .from("expenses")
    .select("category, amount")
    .gte("spent_at", fromStr);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const byCat = (data || []).reduce((acc, row) => {
    const key = row.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + Number(row.amount || 0);
    return acc;
  }, {});

  return Object.entries(byCat)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getExpensesPaginated(page = 1, filters = {}) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("expenses")
    .select("*", { count: "exact" });

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.fromDate) {
    query = query.gte("spent_at", filters.fromDate);
  }
  if (filters.toDate) {
    query = query.lte("spent_at", filters.toDate);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.minAmount !== undefined && filters.minAmount !== "") {
    query = query.gte("amount", filters.minAmount);
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== "") {
    query = query.lte("amount", filters.maxAmount);
  }

  if (filters.paymentMode) {
    query = query.eq("payment_mode", filters.paymentMode);
  }

  if (filters.source === "manual") {
    query = query.is("subscription_id", null);
  } else if (filters.source === "subscription") {
    query = query.not("subscription_id", "is", null);
  }

  const search = filters.search?.trim();
  if (search) {
    const isNumericSearch = !Number.isNaN(Number(search));
    const parsedDate = new Date(search);
    const isValidDate = !Number.isNaN(parsedDate.getTime());

    const orParts = [
      `title.ilike.%${search}%`,
      `category.ilike.%${search}%`,
      `payment_mode.ilike.%${search}%`,
    ];

    if (isNumericSearch) {
      orParts.push(`amount.eq.${Number(search)}`);
    }

    if (isValidDate) {
      const iso = parsedDate.toISOString().split("T")[0];
      orParts.push(`spent_at.eq.${iso}`);
    }

    query = query.or(orParts.join(","));
  }

  // Sort: amount sort takes precedence; otherwise date desc
  if (filters.amountSort === "asc" || filters.amountSort === "desc") {
    query = query.order("amount", { ascending: filters.amountSort === "asc" });
  } else {
    query = query.order("spent_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    expenses: data,
    total: count,
  };
}

// Delete a single expense by id (optionally scoped to a user).
export async function deleteExpense(expenseId, userId) {
  if (!expenseId) throw new Error("expenseId is required to delete an expense");

  let query = supabase.from("expenses").delete().eq("id", expenseId);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;
  return { error };
}
