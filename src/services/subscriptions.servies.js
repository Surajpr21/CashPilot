import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 5;

export async function addSubscription(payload) {
  // Ensure user_id is attached and strip any forbidden fields
  const {
    status, created_at, updated_at, cancelled_at, id, // strip these if present
    ...rest
  } = payload || {};

  // Fetch current user if user_id not provided
  let userId = rest.user_id;
  if (!userId) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Not authenticated");
    userId = user.id;
  }

  const clean = { ...rest, user_id: userId };

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([clean])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_due", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSubscriptionsPaginated({ page = 1, filters = {} }) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("subscriptions")
    .select("*", { count: "exact" })
    .order("next_due", { ascending: true });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.billing_cycle) {
    query = query.eq("billing_cycle", filters.billing_cycle);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    subscriptions: data,
    total: count,
  };
}

export async function getUpcomingSubscriptions(userId) {
  // Fetch active subscriptions for the user, including overdue ones.
  let query = supabase
    .from("subscriptions")
    .select("id, name, amount, next_due, status, user_id")
    .eq("status", "active");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("next_due", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateSubscription(id, updates) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(id) {
  return updateSubscription(id, {
    status: "inactive",
    cancelled_at: new Date().toISOString(),
  });
}

/**
 * Helper: Calculate next due date based on billing cycle
 */
function getNextDueDate(currentDue, billingCycle) {
  const date = new Date(currentDue);
  
  switch (billingCycle) {
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // default to monthly
  }
  
  return date.toISOString().split("T")[0];
}

/**
 * Mark subscription as paid:
 * 1. Check if expense already exists (prevent duplicates)
 * 2. Insert expense for this payment
 * 3. Advance next_due date
 */
export async function markSubscriptionAsPaid(subscription) {
  const { data: existingExpense, error: checkError } = await supabase
    .from("expenses")
    .select("*")
    .eq("subscription_id", subscription.id)
    .eq("spent_at", subscription.next_due)
    .limit(1)
    .maybeSingle();

  if (checkError) throw checkError;
  
  if (existingExpense) {
    // Expense already exists, stop here
    return { message: "Payment already recorded", expense: existingExpense };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not authenticated");

  const today = new Date().toISOString().split("T")[0];
  const { data: newExpense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      spent_at: today,
      title: subscription.name,
      category: "Subscriptions",
      sub_category: subscription.name,
      amount: subscription.amount,
      payment_mode: subscription.payment_method || "Online",
      subscription_id: subscription.id,
      user_id: user.id,
    })
    .select()
    .single();

  if (expenseError) throw expenseError;

  const nextDue = getNextDueDate(subscription.next_due, subscription.billing_cycle);
  
  const { data: updatedSub, error: updateError } = await supabase
    .from("subscriptions")
    .update({ next_due: nextDue })
    .eq("id", subscription.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return {
    message: "Payment recorded successfully",
    expense: newExpense,
    subscription: updatedSub,
  };
}
