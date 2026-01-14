import "./SubscriptionsPage.css";
import SubscriptionsFilters from "./SubsCards/SubscriptionsFilters";
import SubscriptionsTable from "./SubsCards/SubscriptionsTable";
import UpcomingSubscriptions from "./SubsCards/UpcomingSubscriptions";
import React, { useEffect, useState } from "react";
import { getSubscriptionsPaginated, updateSubscription, cancelSubscription, markSubscriptionAsPaid } from "../../../services/subscriptions";

const PAGE_SIZE = 5;

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    billing_cycle: "",
    category: "",
    search: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionsPaginated({
        page,
        filters,
      });
      setSubs(res.subscriptions || []);
      setTotalCount(res.total || 0);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, filters]);

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

  const handleMarkAsPaid = async (subscription) => {
    try {
      await markSubscriptionAsPaid(subscription);
      load();
    } catch (error) {
      console.error("Error marking subscription as paid:", error);
      alert(error.message || "Failed to mark subscription as paid");
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="subscriptions-page-container">
      <div className="subscriptions-page-header">
        <div>
          <h1 className="subscriptions-page-title">Subscriptions</h1>
          <p className="subscriptions-page-subtitle">
            Manage your recurring payments and renewals
          </p>
        </div>
      </div>

      <SubscriptionsFilters 
        onSubscriptionAdded={load} 
        subs={subs}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="subscriptions-page-content">
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && (
          <>
            <div className="subscriptions-flex-wrapper">
              <SubscriptionsTable
                subs={subs}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={handleCancel}
                onEdit={load}
                onReactivate={handleReactivate}
                onMarkAsPaid={handleMarkAsPaid}
              />
              <UpcomingSubscriptions />
            </div>
            
            {totalPages > 0 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
