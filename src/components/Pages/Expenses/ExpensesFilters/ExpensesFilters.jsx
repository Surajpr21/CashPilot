import React from "react";
import "./ExpensesFilters.css";

export default function ExpensesFilters() {
  return (
    <div className="expenses-page-filters">
      <div className="expenses-page-filter">This month</div>
      <div className="expenses-page-filter">All categories</div>
      <div className="expenses-page-filter">All sub-categories</div>
      <div className="expenses-page-filter">Any amount</div>
      <div className="expenses-page-filter">All payment modes</div>
      <button className="expenses-page-clear-filters">Clear filters</button>
      <button className="expenses-page-add-expense">+ Add Expense</button>


      <div className="expenses-page-summary">
        <div className="expense-page-left">
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Total spent:</span>
            <span className="expenses-page-summary-value">₹24,093</span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Average per day:</span>
            <span className="expenses-page-summary-value">₹803</span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Transactions:</span>
            <span className="expenses-page-summary-value">32</span>
          </div>
        </div>
        <div className="expense-page-right">
          <button className="expenses-page-export">Export CSV</button>
        </div>
      </div>
    </div>
  );
}
