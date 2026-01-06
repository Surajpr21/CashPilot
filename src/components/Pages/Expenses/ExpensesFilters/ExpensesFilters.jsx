import React, { useEffect, useState } from "react";
import "./ExpensesFilters.css";
import ExpenseForm from "./ExpenseForm/ExpenseForm";
import { getExpenseStats } from "../../../../services/expenses.service";

export default function ExpensesFilters({ onExpenseAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    total_spent: 0,
    avg_per_day: 0,
    transactions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      setLoadingStats(true);
      const { data, error } = await getExpenseStats();
      if (!active) return;

      if (error) {
        setStatsError(error.message || "Failed to load stats");
      } else {
        setStatsError(null);
        setStats(
          data || { total_spent: 0, avg_per_day: 0, transactions: 0 }
        );
      }

      setLoadingStats(false);
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="expenses-page-filters">
      <div className="expenses-page-filter">This month</div>
      <div className="expenses-page-filter">All categories</div>
      <div className="expenses-page-filter">All sub-categories</div>
      <div className="expenses-page-filter">Any amount</div>
      <div className="expenses-page-filter">All payment modes</div>
      <button className="expenses-page-clear-filters">Clear filters</button>
      <button
        className="expenses-page-add-expense"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Close" : "+ Add Expense"}
      </button>


      <div className="expenses-page-summary">
        <div className="expense-page-left">
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Total spent:</span>
            <span className="expenses-page-summary-value">
              {loadingStats ? "…" : `₹${formatNumber(stats.total_spent)}`}
            </span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Average per day:</span>
            <span className="expenses-page-summary-value">
              {loadingStats ? "…" : `₹${formatNumber(stats.avg_per_day)}`}
            </span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Transactions:</span>
            <span className="expenses-page-summary-value">
              {loadingStats ? "…" : formatNumber(stats.transactions)}
            </span>
          </div>
        </div>
        <div className="expense-page-right">
          <button className="expenses-page-export">Export CSV</button>
        </div>
      </div>

      {statsError && (
        <div className="expenses-page-stats-error">{statsError}</div>
      )}

      {showForm && (
        <div
          className="expense-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="expense-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="expense-modal-close"
              aria-label="Close"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <ExpenseForm 
              onClose={() => setShowForm(false)} 
              onExpenseAdded={onExpenseAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
}
