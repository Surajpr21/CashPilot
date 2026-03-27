import React, { useMemo } from "react";
import "./BudgetVsActual.css";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../../../contexts/DashboardDataContext";

const isDarkTheme = () =>
  typeof document !== "undefined" &&
  document
    .querySelector(".dashboard-container")
    ?.matches(':has(.theme-switch__checkbox:checked)');

const palette = (dark) => ({
  safe: {
    fill: dark ? "#34D399" : "#9FD2A8",
    track: dark ? "#163B2F" : "#CFE8D7",
    chipBg: dark ? "#1F4D3C" : "#9FD2A8",
    chipText: dark ? "#EAFBF3" : "#2E2E2E",
  },
  warn: {
    fill: dark ? "#FBBF24" : "#F4C463",
    track: dark ? "#4A3815" : "#FAE8B8",
    chipBg: dark ? "#5A4318" : "#F4C463",
    chipText: dark ? "#FFF6E1" : "#2E2E2E",
  },
  danger: {
    fill: dark ? "#F87171" : "#E46A63",
    track: dark ? "#4B1F23" : "#F3C3BC",
    chipBg: dark ? "#5A252B" : "#E46A63",
    chipText: dark ? "#FFEDEE" : "#2E2E2E",
  },
});

const getBucket = (pct) => {
  if (pct < 70) return "safe";
  if (pct <= 100) return "warn";
  return "danger";
};

const getBarColor = (totalPercent, dark) => palette(dark)[getBucket(totalPercent)].fill;
const getPercentColor = (totalPercent, dark) => palette(dark)[getBucket(totalPercent)].chipText;
const getPercentBackground = (totalPercent, dark) => palette(dark)[getBucket(totalPercent)].chipBg;
const getRowBarColor = (pct, dark) => palette(dark)[getBucket(pct)].fill;
const getTrackColor = (pct, dark) => palette(dark)[getBucket(pct)].track;

const BudgetVsActual = () => {
  const navigate = useNavigate();
  const { budgetSummary, loading } = useDashboardData();

  const dark = isDarkTheme();

  const categories = useMemo(() => budgetSummary?.categories || [], [budgetSummary?.categories]);

  const totalBudget = budgetSummary?.totalBudget ?? 0;
  const totalActual = budgetSummary?.totalActual ?? 0;

  const totalPercent = useMemo(() => {
    if (!totalBudget) return 0;
    return Math.round((totalActual / totalBudget) * 100);
  }, [totalActual, totalBudget]);

  return (
    <div className="budget-card">
      <div className="budget-header">
        <h3>Budget vs Actual</h3>
        <div className="budget-header-actions">
          <button className="bills-manage" onClick={() => navigate("/budgets")}>Manage →</button>
          {/* <button className="budget-filter" disabled>
            This month ▾
          </button> */}
        </div>
      </div>

      <div className="budget-total-row">
        <span>Total</span>
        <div className="budget-total-values">
          <span>₹{totalBudget.toLocaleString()}</span>
          <span>₹{totalActual.toLocaleString()}</span>
        </div>
      </div>

      <div className="budget-total-bar">
        <div className="budget-total-budget" style={{ backgroundColor: getTrackColor(totalPercent, dark) }}>
          <div
            className="budget-total-actual"
            style={{
              width: `${Math.min(totalPercent, 100)}%`,
              backgroundColor: getBarColor(totalPercent, dark),
            }}
          />
        </div>

        <span
          className="budget-total-percent"
          style={{
            backgroundColor: getPercentBackground(totalPercent, dark),
            color: getPercentColor(totalPercent, dark),
          }}
        >
          {totalPercent}%
        </span>
      </div>

      <div className="budget-list">
        {categories.map((c, i) => {
          const pct = c.budget ? (c.actual / c.budget) * 100 : 0;

          return (
            <div key={i} className="budget-row">
              <span className="budget-name">{c.name}</span>

              <div className="budget-bar">
                <div className="budget-bar-budget" style={{ backgroundColor: getTrackColor(pct || 0, dark) }}>
                  <div
                    className="budget-bar-actual"
                    style={{
                      width: `${Math.min(pct || 0, 100)}%`,
                      backgroundColor: getRowBarColor(pct || 0, dark),
                    }}
                  />
                </div>
              </div>

              <span className="budget-value">₹{Number(c.actual || 0).toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      <div className="budget-footer">
        <div>
          <span>Budget</span>
          <strong>₹{totalBudget.toLocaleString()}</strong>
        </div>
        <div className="budget-footer-actual">
          <span>Actual</span>
          <strong>₹{totalActual.toLocaleString()}</strong>
        </div>
      </div>
      {loading && <div className="budget-loading">Refreshing…</div>}
    </div>
  );
};

export default BudgetVsActual;

