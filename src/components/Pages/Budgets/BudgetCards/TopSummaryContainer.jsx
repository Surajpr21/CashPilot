import React, { useMemo, useState } from "react";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";
import "./bVaPageTop.css";

export default function TopSummaryContainer({
  rows,
  loading,
  onAddBudgetClick,
  monthDisplay,
  onPrevMonth,
  onNextMonth,
}) {
  const CATEGORY_ALL = "all-categories";
  const AMOUNT_ALL = "all-amount";
  const CYCLE_ALL = "all-cycles";

  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_ALL);
  const [amountFilter, setAmountFilter] = useState(AMOUNT_ALL);
  const [cycleFilter, setCycleFilter] = useState(CYCLE_ALL);
  const [searchTerm, setSearchTerm] = useState("");

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(rows.map((r) => r.category).filter(Boolean))
    );

    return [
      { label: "All categories", value: CATEGORY_ALL },
      ...uniqueCategories.map((category) => ({ label: category, value: category })),
    ];
  }, [rows]);

  const amountOptions = [
    { label: "All amount", value: AMOUNT_ALL },
    { label: "Over budget", value: "over" },
    { label: "Under budget", value: "under" },
    { label: "On track", value: "on-track" },
  ];

  const cycleOptions = [
    { label: "All cycles", value: CYCLE_ALL },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Annual", value: "annual" },
  ];

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

  return (
    <div className="bVa-page-top-container">
     

      {/* Filters */}
      <div className="bVa-page-filters">
         <div className="bVa-page-month-selector">
        <button className="bVa-page-month-btn" onClick={onPrevMonth}>
          ‹
        </button>
        <span>{monthDisplay}</span>
        <button className="bVa-page-month-btn" onClick={onNextMonth}>
          ›
        </button>
      </div>
        <div className="bVa-page-filter bVa-page-filter--dropdown">
          <CustomDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            placeholder="All categories"
            width="200px"
            menuMaxHeight="240px"
            disabled={loading}
          />
        </div>
        <div className="bVa-page-filter bVa-page-filter--dropdown">
          <CustomDropdown
            value={cycleFilter}
            onChange={setCycleFilter}
            options={cycleOptions}
            placeholder="All cycles"
            width="150px"
            disabled={loading}
          />
        </div>
        <div className="bVa-page-filter bVa-page-filter--dropdown">
          <CustomDropdown
            value={amountFilter}
            onChange={setAmountFilter}
            options={amountOptions}
            placeholder="All amount"
            width="170px"
            disabled={loading}
          />
        </div>

        <div className="bVa-page-filter">
          <input
            type="text"
            placeholder="Search date, title, category..."
            className="bVa-page-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bVa-page-filter-actions">
          <button
            className="bVa-page-clear-btn"
            onClick={() => {
              setCategoryFilter(CATEGORY_ALL);
              setAmountFilter(AMOUNT_ALL);
              setCycleFilter(CYCLE_ALL);
              setSearchTerm("");
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
            {formatCurrency(Math.abs(overUnder))}
          </strong>
        </span>

        <button className="bVa-page-import-btn">Import CSV</button>
      </div>
    </div>
  );
}
