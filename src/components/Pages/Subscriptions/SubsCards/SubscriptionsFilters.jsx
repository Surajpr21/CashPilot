import React, { useState, useEffect } from "react";
import SubscriptionForm from "./SubscriptionForm/SubscriptionForm";
import { getMonthlyTotal } from "../utils/subscriptions.utils";
import { CATEGORIES } from "../../../../constants/categories";

export default function SubscriptionsFilters({ onSubscriptionAdded, subs = [], filters, onFilterChange }) {
  const [showForm, setShowForm] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {
    status: "",
    billing_cycle: "",
    category: "",
    search: "",
  });
  const monthlyTotal = getMonthlyTotal(subs);

  // Update local filters when parent filters change
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  const handleLocalChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const resetFilters = {
      status: "",
      billing_cycle: "",
      category: "",
      search: "",
    };
    setLocalFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  return (
    <div className="subscriptions-page-filters-wrapper">
      <div className="subscriptions-page-filters-row">
        <select 
          className="subscriptions-page-filter"
          value={localFilters.status}
          onChange={(e) => handleLocalChange("status", e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="inactive">Inactive</option>
        </select>

        <select 
          className="subscriptions-page-filter"
          value={localFilters.billing_cycle}
          onChange={(e) => handleLocalChange("billing_cycle", e.target.value)}
        >
          <option value="">All cycles</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>

        <select 
          className="subscriptions-page-filter"
          value={localFilters.category}
          onChange={(e) => handleLocalChange("category", e.target.value)}
        >
          <option value="">All category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button 
          className="subscriptions-page-clear-btn"
          onClick={clearFilters}
        >
          Clear filters
        </button>

        <div className="subscriptions-page-search">
          <input 
            placeholder="Search" 
            value={localFilters.search}
            onChange={(e) => handleLocalChange("search", e.target.value)}
          />
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
