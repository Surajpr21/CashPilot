import React, { useEffect, useState } from "react";
import { formatAmount, daysLeft, dateLabel } from "../utils/subscriptions.utils";
import { getUpcomingSubscriptions } from "../../../../services/subscriptions";

export default function UpcomingSubscriptions() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingSubscriptions();
        if (active) {
          setUpcoming(data || []);
          setError("");
        }
      } catch (e) {
        if (active) {
          setError(e.message || "Failed to load upcoming subscriptions");
          setUpcoming([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="subscriptions-page-upcoming">
      <h3 className="subscriptions-page-upcoming-title">Upcoming Payments</h3>

      {loading && <div style={{ fontSize: "14px", color: "#999" }}>Loading…</div>}
      {error && <div style={{ fontSize: "14px", color: "#d64545" }}>{error}</div>}

      {!loading && upcoming.length === 0 && (
        <div className="subscriptions-page-upcoming-item">
          <span>No upcoming payments</span>
        </div>
      )}

      {!loading && upcoming.map((s) => {
        const dLeft = daysLeft(s.next_due);
        const dueText = `in ${dLeft} days • ${dateLabel(s.next_due)}`;
        return (
          <div key={s.id} className="subscriptions-page-upcoming-item">
            <span>{s.name} <small style={{ color: '#6b7280' }}>({dueText})</small></span>
            <span>{formatAmount(s.amount)}</span>
          </div>
        );
      })}
    </div>
  );
}
