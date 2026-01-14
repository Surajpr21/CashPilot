import React, { useState } from "react";

export default function TopSummaryContainer({ rows, loading, onAddBudgetClick }) {
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [amountFilter, setAmountFilter] = useState("All amount");

  const totalPlanned = rows.reduce((sum, r) => sum + (r.planned || 0), 0);
  const totalActual = rows.reduce((sum, r) => sum + (r.actual || 0), 0);
  const overUnder = totalActual - totalPlanned;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const getOverUnderStatus = () => {
    if (overUnder > 0) return "bVa-page-over";
    return "bVa-page-under";
  };

  const filteredRows = rows.filter((row) => {
    if (categoryFilter !== "All categories" && row.category !== categoryFilter) {
      return false;
    }
    if (amountFilter === "Over budget" && row.diff <= 0) return false;
    if (amountFilter === "Under budget" && row.diff >= 0) return false;
    if (amountFilter === "On track" && row.status !== "on-track") return false;
    return true;
  });

  return (
    <div className="bVa-page-top-container">
      {/* Filters */}
      <div className="bVa-page-filters">
        <div className="bVa-page-filter">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All categories</option>
            {rows.map((r) => (
              <option key={r.category}>{r.category}</option>
            ))}
          </select>
        </div>
        <div className="bVa-page-filter">All cycles ▾</div>
        <div className="bVa-page-filter">
          <select value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)}>
            <option>All amount</option>
            <option>Over budget</option>
            <option>Under budget</option>
            <option>On track</option>
          </select>
        </div>

        <div className="bVa-page-filter-actions">
          <button
            className="bVa-page-clear-btn"
            onClick={() => {
              setCategoryFilter("All categories");
              setAmountFilter("All amount");
            }}
          >
            Clear filters
          </button>
          <button className="bVa-page-add-btn" onClick={onAddBudgetClick}>
            + Add Budget
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="bVa-page-summary-strip">
        <span>
          Total Budget: <strong>{formatCurrency(totalPlanned)}</strong>
        </span>
        <span>
          Actual Spend: <strong>{formatCurrency(totalActual)}</strong>
        </span>
        <span className={getOverUnderStatus()}>
          {overUnder > 0 ? "Over budget:" : "Under budget:"}
          <strong>
            {overUnder > 0 ? "+" : ""}
            {formatCurrency(overUnder)}
          </strong>
        </span>

        <button className="bVa-page-import-btn">Import CSV</button>
      </div>
    </div>
  );
}
