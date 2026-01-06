import React, { useState } from "react";
import SubscriptionForm from "./SubscriptionForm/SubscriptionForm";
import { getMonthlyTotal } from "../utils/subscriptions.utils";

export default function SubscriptionsFilters({ onSubscriptionAdded, subs = [] }) {
  const [showForm, setShowForm] = useState(false);
  const monthlyTotal = getMonthlyTotal(subs);

  return (
    <div className="subscriptions-page-filters-wrapper">
      <div className="subscriptions-page-filters-row">
        <select className="subscriptions-page-filter">
          <option>All status</option>
        </select>

        <select className="subscriptions-page-filter">
          <option>All cycles</option>
        </select>

        <select className="subscriptions-page-filter">
          <option>All category</option>
        </select>

        <button className="subscriptions-page-clear-btn">
          Clear filters
        </button>

        <div className="subscriptions-page-search">
          <input placeholder="Search" />
        </div>

          <button
            className="subscriptions-page-add-btn"
            onClick={() => setShowForm(true)}
          >
          + Add Subscription
        </button>
      </div>

      {/* Total Spend */}
      <div className="subscriptions-page-total-spend">
        You spend <strong>₹{monthlyTotal.toFixed(0)}</strong> every month on
        subscriptions.
      </div>

      {showForm && (
        <div
          className="subs-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="subs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="subs-modal-close"
              aria-label="Close"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <SubscriptionForm
              onClose={() => setShowForm(false)}
              onSubscriptionAdded={onSubscriptionAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
