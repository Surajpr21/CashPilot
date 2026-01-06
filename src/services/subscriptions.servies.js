import { supabase } from "../lib/supabaseClient";

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

export async function getUpcomingSubscriptions() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, name, amount, next_due, status")
    .eq("status", "active")
    .gte("next_due", today)
    .order("next_due", { ascending: true })
    .limit(5);

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
