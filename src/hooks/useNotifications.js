import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../services/notifications.service";

// Temporary hard-coded notifications to keep UI visible while backend wiring is validated
const MOCK_NOTIFICATIONS = [
  {
    id: "mock-1",
    title: "Income reminder",
    message: "Log your income for this month to keep budgets accurate.",
    type: "income_reminder",
  },
  {
    id: "mock-2",
    title: "Subscription due",
    message: "Your streaming plan renews tomorrow.",
    type: "subscription",
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async (signal = { cancelled: false }) => {
    setLoading(true);

    // Temporary UI fix: load mock notifications instead of hitting Supabase
    if (!signal.cancelled) {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }
    return;

    try {
      const data = await getUnreadNotifications();
      if (!signal.cancelled) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      if (!signal.cancelled) {
        setLoading(false);
      }
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchNotifications(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => {
            const exists = prev.some((notif) => notif.id === payload.new.id);
            if (exists) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    refresh: fetchNotifications,
  };
};
