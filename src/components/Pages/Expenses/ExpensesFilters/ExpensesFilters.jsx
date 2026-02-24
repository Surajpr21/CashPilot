import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./ExpensesFilters.css";
import ExpenseForm from "./ExpenseForm/ExpenseForm";
import { getExpenseStats } from "../../../../services/expenses.service";
import { CATEGORIES } from "../../../../constants/categories";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

export default function ExpensesFilters({ filters, onFilterChange, onExpenseAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    amountSort: filters?.amountSort || "",
    search: filters?.search || "",
  });
  const [stats, setStats] = useState({
    total_spent: 0,
    avg_per_day: 0,
    transactions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters({
      ...filters,
      amountSort: filters?.amountSort || "",
      search: filters?.search || "",
    });
  }, [filters]);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      setLoadingStats(true);
      const { data, error } = await getExpenseStats(filters.fromDate, filters.toDate);
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
  }, [filters.fromDate, filters.toDate]);

  const handleLocalChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters); // Auto-apply on change
  };

  const clearFilters = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const resetFilters = {
      fromDate: from,
      toDate: to,
      category: "",
      amountSort: "",
      paymentMode: "",
      search: "",
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const setDatePreset = (preset) => {
    if (preset === "custom") {
      const customFilters = { ...localFilters, fromDate: "", toDate: "" };
      setLocalFilters(customFilters);
      onFilterChange(customFilters);
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let from, to;
    
    if (preset === "thisMonth") {
      from = new Date(year, month, 1).toISOString().split("T")[0];
      to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    } else if (preset === "lastMonth") {
      from = new Date(year, month - 1, 1).toISOString().split("T")[0];
      to = new Date(year, month, 0).toISOString().split("T")[0];
    } else if (preset === "lastYear") {
      from = new Date(year - 1, 0, 1).toISOString().split("T")[0];
      to = new Date(year - 1, 11, 31).toISOString().split("T")[0];
    }
    
    const newFilters = { ...localFilters, fromDate: from, toDate: to };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const datePresetOptions = [
    { value: "This month", label: "This month" },
    { value: "Last month", label: "Last month" },
    { value: "Last year", label: "Last year" },
    { value: "Custom range", label: "Custom range" },
  ];

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const amountSortOptions = [
    { value: "", label: "Any amount" },
    { value: "asc", label: "Amount: Low → High" },
    { value: "desc", label: "Amount: High → Low" },
  ];

  const paymentOptions = [
    { value: "", label: "All payment modes" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  // Get current date preset label
  const getDatePresetLabel = () => {
    const now = new Date();
    const thisMonthFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const thisMonthTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const lastMonthFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastMonthTo = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const lastYearFrom = new Date(now.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
    const lastYearTo = new Date(now.getFullYear() - 1, 11, 31).toISOString().split("T")[0];

    if (localFilters.fromDate === thisMonthFrom && localFilters.toDate === thisMonthTo) {
      return "This month";
    } else if (localFilters.fromDate === lastMonthFrom && localFilters.toDate === lastMonthTo) {
      return "Last month";
    } else if (localFilters.fromDate === lastYearFrom && localFilters.toDate === lastYearTo) {
      return "Last year";
    }
    return "Custom range";
  };

  return (
    <div className="expenses-page-filters">
      {/* 1∩╕ÅΓâú Date Filter (PRIMARY) - Dropdown with presets */}
      <CustomDropdown
        value={getDatePresetLabel()}
        options={datePresetOptions}
        onChange={(val) => {
          if (val === "Custom range") {
            const customFilters = { ...localFilters, fromDate: "", toDate: "" };
            setLocalFilters(customFilters);
            onFilterChange(customFilters);
          } else if (val === "This month") {
            setDatePreset("thisMonth");
          } else if (val === "Last month") {
            setDatePreset("lastMonth");
          } else if (val === "Last year") {
            setDatePreset("lastYear");
          }
        }}
        placeholder="This month"
        width="190px"
      />

      {/* Custom date range inputs (shown when needed) */}
      {getDatePresetLabel() === "Custom range" && (
        <>
          <input
            type="date"
            className="expenses-page-filter expenses-date-input"
            value={localFilters.fromDate}
            onChange={(e) => handleLocalChange("fromDate", e.target.value)}
          />
          <input
            type="date"
            className="expenses-page-filter expenses-date-input"
            value={localFilters.toDate}
            onChange={(e) => handleLocalChange("toDate", e.target.value)}
          />
        </>
      )}

      {/* 2∩╕ÅΓâú Category Filter */}
      <CustomDropdown
        value={localFilters.category}
        options={categoryOptions}
        onChange={(val) => handleLocalChange("category", val)}
        placeholder="All categories"
        width="190px"
        menuMaxHeight="260px"
      />

      {/* 3∩╕ÅΓâú Any amount (sort) */}
      <CustomDropdown
        value={localFilters.amountSort}
        options={amountSortOptions}
        onChange={(val) => handleLocalChange("amountSort", val)}
        placeholder="Any amount"
        width="180px"
      />

      {/* 4∩╕ÅΓâú Payment Mode Filter */}
      <CustomDropdown
        value={localFilters.paymentMode}
        options={paymentOptions}
        onChange={(val) => handleLocalChange("paymentMode", val)}
        placeholder="All payment modes"
        width="200px"
      />

      {/* 5∩╕ÅΓâú Search across date/title/category/amount/payment */}
      <div className="expenses-search-wrapper">
        <input
          type="text"
          className="expenses-page-filter"
          value={localFilters.search}
          onChange={(e) => handleLocalChange("search", e.target.value)}
          placeholder="Search date, title, category, amount, payment"
        />
        <div className="expenses-search-hint">Type dates as yyyy-mm-dd</div>
      </div>

      <button className="expenses-page-clear-filters" onClick={clearFilters}>
        Clear filters
      </button>
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
              {loadingStats ? "...." : `${formatNumber(stats.total_spent)}`}
            </span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Average per day:</span>
            <span className="expenses-page-summary-value">
              {loadingStats ? "...." : `${formatNumber(stats.avg_per_day)}`}
            </span>
          </div>
          <div className="expenses-page-summary-item">
            <span className="expenses-page-summary-label">Transactions:</span>
            <span className="expenses-page-summary-value">
              {loadingStats ? "...." : formatNumber(stats.transactions)}
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

      {showForm && createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
}
