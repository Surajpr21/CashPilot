import { supabase } from "../lib/supabaseClient";

export const getUnreadNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const markNotificationAsRead = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
};
