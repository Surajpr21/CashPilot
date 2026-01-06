import "./SubscriptionsPage.css";
import SubscriptionsFilters from "./SubsCards/SubscriptionsFilters";
import SubscriptionsTable from "./SubsCards/SubscriptionsTable";
import UpcomingSubscriptions from "./SubsCards/UpcomingSubscriptions";
import React, { useEffect, useState } from "react";
import { getSubscriptions, updateSubscription, cancelSubscription } from "../../../services/subscriptions";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubs(data || []);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePause = async (id) => {
    await updateSubscription(id, { status: "paused" });
    load();
  };

  const handleResume = async (id) => {
    await updateSubscription(id, { status: "active" });
    load();
  };

  const handleCancel = async (id) => {
    await cancelSubscription(id);
    load();
  };

  const handleReactivate = async (id, nextDue) => {
    await updateSubscription(id, {
      status: "active",
      cancelled_at: null,
      next_due: nextDue,
    });
    load();
  };

  return (
    <div className="subscriptions-page-container">
      {/* Header */}
      <div className="subscriptions-page-header">
        <div>
          <h1 className="subscriptions-page-title">Subscriptions</h1>
          <p className="subscriptions-page-subtitle">
            Manage your recurring payments and renewals
          </p>
        </div>

      
      </div>

      {/* Filters */}
      <SubscriptionsFilters onSubscriptionAdded={load} subs={subs} />

      {/* Content */}
      <div className="subscriptions-page-content">
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && (
          <SubscriptionsTable
            subs={subs}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onEdit={load}
            onReactivate={handleReactivate}
          />
        )}
        <UpcomingSubscriptions />
      </div>
    </div>
  );
}
