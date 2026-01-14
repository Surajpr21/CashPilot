import React, { useState } from "react";
import { updateBudgetAmount } from "../../../../services/budgets.service";

export default function CategoryBreakdownContainer({
  rows,
  loading,
  currentMonth,
  setBudgets,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const getStatusBadge = (diff) => {
    if (diff > 0) {
      return { label: `+${formatCurrency(diff)}`, type: "danger", icon: "⚠️" };
    }
    if (diff < 0) {
      return {
        label: `-${formatCurrency(Math.abs(diff))}`,
        type: "success",
        icon: "🎉",
      };
    }
    return { label: "On track", type: "neutral", icon: "✅" };
  };

  const generateInsights = () => {
    const insightMap = new Map();

    rows.forEach((row) => {
      if (row.diff > 0) {
        insightMap.set(
          row.category,
          `⚠️ ${row.category} exceeded budget by ${formatCurrency(row.diff)}`
        );
      } else if (row.diff < 0) {
        insightMap.set(
          row.category,
          `✅ ${row.category} saved ${formatCurrency(Math.abs(row.diff))} this month`
        );
      }
    });

    return Array.from(insightMap.values());
  };

  // Handle edit budget
  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditAmount(row.planned);
  };

  // Handle save budget
  const handleSaveBudget = async (rowId) => {
    if (!editAmount || editAmount <= 0) return;

    try {
      setUpdatingId(rowId);
      await updateBudgetAmount(rowId, parseFloat(editAmount));
      // Update local budgets so UI recalculates instantly
      if (typeof setBudgets === "function") {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === rowId ? { ...b, amount: parseFloat(editAmount) } : b
          )
        );
      }
      setEditingId(null);
      setEditAmount("");
    } catch (error) {
      console.error("Error updating budget:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount("");
  };

  if (loading) {
    return (
      <div className="bVa-page-category-container">
        <h2 className="bVa-page-section-title">Category-wise Breakdown</h2>
        <p>Loading budget data...</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bVa-page-category-container">
        <h2 className="bVa-page-section-title">Category-wise Breakdown</h2>
        <p>No budget data available for this month.</p>
      </div>
    );
  }

  const insights = generateInsights();

  return (
    <div className="bVa-page-category-container">
      <h2 className="bVa-page-section-title">Category-wise Breakdown</h2>

      {/* STEP 6: Render budget bars from merged rows */}
      {rows.map((row) => (
        <div key={row.id} className="bVa-page-category-row">
          {/* LEFT CONTENT */}
          <div className="bVa-page-category-main">
            <div className="bVa-page-category-title">{row.category}</div>
            <div className="bVa-page-category-sub">
              {formatCurrency(row.planned)} budget • {formatCurrency(row.actual)}
            </div>

            {editingId === row.id ? (
              <div className="bVa-page-edit-input-group">
                <label>Edit Budget Amount:</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Enter new budget amount"
                  min="0"
                />
              </div>
            ) : (
              <div className="bVa-page-budget-label">
                budget {formatCurrency(row.planned)}
              </div>
            )}

            {/* STEP 6: Progress bar from merged data */}
            <div className="bVa-page-progress-track">
              <div
                className={`bVa-page-progress-fill bVa-${row.status}`}
                style={{ width: `${row.progress * 100}%` }}
              />
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="bVa-page-category-actions">
            {editingId === row.id ? (
              <div className="bVa-page-edit-buttons">
                <button
                  className="bVa-page-save-btn"
                  onClick={() => handleSaveBudget(row.id)}
                  disabled={updatingId === row.id}
                >
                  {updatingId === row.id ? "Saving..." : "Save"}
                </button>
                <button
                  className="bVa-page-cancel-btn"
                  onClick={handleCancel}
                  disabled={updatingId === row.id}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {/* STEP 5: Badge from merged data */}
                <span className={`bVa-page-diff bVa-${row.status}`}>
                  {getStatusBadge(row.diff).label}
                </span>

                <button
                  className="bVa-page-edit-btn"
                  onClick={() => handleEditClick(row)}
                >
                  {row.status === "on-track" ? "Edit" : "Edit"}
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* SMART INSIGHTS */}
      {insights.length > 0 && (
        <div className="bVa-page-insights">
          <h4>Smart Insights</h4>
          <ul>
            {insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
