import "./SubscriptionsPage.css";
import SubscriptionsFilters from "./SubsCards/SubscriptionsFilters";
import SubscriptionsTable from "./SubsCards/SubscriptionsTable";
import UpcomingSubscriptions from "./SubsCards/UpcomingSubscriptions";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getSubscriptionsPaginated, updateSubscription, cancelSubscription, markSubscriptionAsPaid } from "../../../services/subscriptions";

const PAGE_SIZE = 5;

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastLoadKeyRef = useRef(null);
  const [filters, setFilters] = useState({
    status: "",
    billing_cycle: "",
    category: "",
    search: "",
  });

  const load = useCallback(
    async ({ force = false } = {}) => {
      const key = JSON.stringify({ page, filters });
      if (!force && lastLoadKeyRef.current === key) {
        return;
      }

      lastLoadKeyRef.current = key;

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
    },
    [page, filters]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handlePause = async (id) => {
    await updateSubscription(id, { status: "paused" });
    load({ force: true });
  };

  const handleResume = async (id) => {
    await updateSubscription(id, { status: "active" });
    load({ force: true });
  };

  const handleCancel = async (id) => {
    await cancelSubscription(id);
    load({ force: true });
  };

  const handleReactivate = async (id, nextDue) => {
    await updateSubscription(id, {
      status: "active",
      cancelled_at: null,
      next_due: nextDue,
    });
    load({ force: true });
  };

  const handleMarkAsPaid = async (subscription) => {
    try {
      await markSubscriptionAsPaid(subscription);
      load({ force: true });
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
        onSubscriptionAdded={() => load({ force: true })} 
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
                onEdit={() => load({ force: true })}
                onReactivate={handleReactivate}
                onMarkAsPaid={handleMarkAsPaid}
              />
              <UpcomingSubscriptions />
            </div>
            
            {totalPages > 0 && (
              <div className="pagination">
                <button
                  className="pagination-btn prev"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </button>

                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>

                <button
                  className="pagination-btn next"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
