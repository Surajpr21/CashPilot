import React, { useState, useEffect } from "react";
import SubscriptionForm from "./SubscriptionForm/SubscriptionForm";
import { getMonthlyTotal } from "../utils/subscriptions.utils";
import { CATEGORIES } from "../../../../constants/categories";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

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
        <CustomDropdown
          value={localFilters.status}
          options={[
            { value: "", label: "All status" },
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "inactive", label: "Inactive" },
          ]}
          onChange={(val) => handleLocalChange("status", val)}
          placeholder="All status"
          width="170px"
          menuMaxHeight="200px"
        />

        <CustomDropdown
          value={localFilters.billing_cycle}
          options={[
            { value: "", label: "All cycles" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
          onChange={(val) => handleLocalChange("billing_cycle", val)}
          placeholder="All cycles"
          width="170px"
          menuMaxHeight="200px"
        />

        <CustomDropdown
          value={localFilters.category}
          options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          onChange={(val) => handleLocalChange("category", val)}
          placeholder="All categories"
          width="190px"
          menuMaxHeight="240px"
        />

  

        <div className="subscriptions-page-search">
          <input 
            placeholder="Search" 
            value={localFilters.search}
            onChange={(e) => handleLocalChange("search", e.target.value)}
          />
        </div>
              <button 
          className="subscriptions-page-clear-btn"
          onClick={clearFilters}
        >
          Clear filters
        </button>

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
