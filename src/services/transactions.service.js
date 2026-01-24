import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 10;

export async function seedIncomeTransaction({ userId, amount, occurredOn, note = "Onboarding income" }) {
  if (!userId) throw new Error("Missing user id for income transaction");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Income amount must be a positive number");
  }

  const payload = {
    user_id: userId,
    type: "income",
    amount,
    occurred_on: occurredOn,
    note,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getIncomePaginated(page = 1, filters = {}) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("type", "income")
    .order("occurred_on", { ascending: false });

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.fromDate) {
    query = query.gte("occurred_on", filters.fromDate);
  }

  if (filters.toDate) {
    query = query.lte("occurred_on", filters.toDate);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.minAmount !== undefined && filters.minAmount !== "") {
    query = query.gte("amount", Number(filters.minAmount));
  }

  if (filters.maxAmount !== undefined && filters.maxAmount !== "") {
    query = query.lte("amount", Number(filters.maxAmount));
  }

  if (filters.search) {
    const safe = filters.search.trim();
    if (safe) {
      query = query.or(
        `note.ilike.%${safe}%,category.ilike.%${safe}%`
      );
    }
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    incomes: data || [],
    total: count || 0,
  };
}

export async function getIncomeSummary(filters = {}) {
  let query = supabase
    .from("transactions")
    .select("amount", { count: "exact" })
    .eq("type", "income");

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.fromDate) {
    query = query.gte("occurred_on", filters.fromDate);
  }

  if (filters.toDate) {
    query = query.lte("occurred_on", filters.toDate);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.minAmount !== undefined && filters.minAmount !== "") {
    query = query.gte("amount", Number(filters.minAmount));
  }

  if (filters.maxAmount !== undefined && filters.maxAmount !== "") {
    query = query.lte("amount", Number(filters.maxAmount));
  }

  if (filters.search) {
    const safe = filters.search.trim();
    if (safe) {
      query = query.or(
        `note.ilike.%${safe}%,category.ilike.%${safe}%`
      );
    }
  }

  const { data, count, error } = await query;

  if (error) throw error;

  const totalIncome = Array.isArray(data)
    ? data.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    : 0;

  return {
    total: totalIncome,
    count: count || 0,
  };
}

export async function upsertIncomeTransaction(entry) {
  const { id, user_id, amount, occurred_on, category, note } = entry;

  if (!user_id) throw new Error("Missing user id for income transaction");
  if (!occurred_on) throw new Error("Income date is required");
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw new Error("Income amount must be greater than zero");
  }

  const payload = {
    user_id,
    type: "income",
    amount: Number(amount),
    occurred_on,
    category: category || null,
    note: note || null,
  };

  if (id) {
    const { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user_id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteIncomeTransaction(id, userId) {
  if (!id) throw new Error("Income id is required for delete");
  if (!userId) throw new Error("User id is required for delete");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}
