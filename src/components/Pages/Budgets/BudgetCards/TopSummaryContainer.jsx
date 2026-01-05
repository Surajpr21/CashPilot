import React from "react";

export default function TopSummaryContainer() {
  return (
    <div className="bVa-page-top-container">
      {/* Filters */}
      <div className="bVa-page-filters">
        <div className="bVa-page-filter">December 2025 ▾</div>
        <div className="bVa-page-filter">All categories ▾</div>
        <div className="bVa-page-filter">All cycles ▾</div>
        <div className="bVa-page-filter">All amount ▾</div>

        <div className="bVa-page-filter-actions">
          <button className="bVa-page-clear-btn">Clear filters</button>
          <button className="bVa-page-add-btn">+ Add Expense</button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="bVa-page-summary-strip">
        <span>Total Budget: <strong>₹40,000</strong></span>
        <span>Actual Spend: <strong>₹43,250</strong></span>
        <span className="bVa-page-over">
          Over budget: <strong>+₹3,250</strong>
        </span>

        <button className="bVa-page-import-btn">Import CSV</button>
      </div>
    </div>
  );
}
