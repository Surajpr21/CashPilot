import React from "react";
import "./BudgetVsActual.css";
import TopSummaryContainer from "./BudgetCards/TopSummaryContainer";
import CategoryBreakdownContainer from "./BudgetCards/CategoryBreakdownContainer";

export default function BudgetVsActualPage() {
  return (
    <div className="bVa-page-wrapper">
      {/* Page Header */}
      <div className="bVa-page-header">
        <div>
          <h1 className="bVa-page-title">Budget vs Actual</h1>
          <p className="bVa-page-subtitle">
            Track how your spending compares to your planned budget
          </p>
        </div>

        <div className="bVa-page-month-selector">
          <button className="bVa-page-month-btn">‹</button>
          <span>December 2025</span>
          <button className="bVa-page-month-btn">›</button>
        </div>
      </div>

      {/* Container 1 */}
      <TopSummaryContainer />

      {/* Container 2 */}
      <CategoryBreakdownContainer />
    </div>
  );
}
