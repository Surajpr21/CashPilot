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

  const getProgressLabel = (diff) => {
    if (diff > 0) return `exceeded ${formatCurrency(diff)}`;
    if (diff < 0) return `saved ${formatCurrency(Math.abs(diff))}`;
    return "on track";
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
      <div className="bVa-page-category-grid">
        {rows.map((row) => (
          <div key={row.id} className="bVa-page-category-row">
            <div className="bVa-row-top">
              <div className="bVa-page-category-main">
                <div className="bVa-page-category-title">{row.category}</div>
                <div className="bVa-page-category-sub">
                  {formatCurrency(row.planned)} budget • {formatCurrency(row.actual)}
                </div>
              </div>

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
                  <button
                    className="bVa-page-edit-btn"
                    onClick={() => handleEditClick(row)}
                  >
                    Edit
                  </button>
                )}
              </div>
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

            <div className="bVa-page-progress-area">
              <div className="bVa-page-progress-track">
                <div
                  className={`bVa-page-progress-fill bVa-${row.status}`}
                  style={{ width: `${row.progress * 100}%` }}
                />
              </div>
              {editingId !== row.id && (
                <span className={`bVa-page-progress-pill bVa-${row.status}`}>
                  {getProgressLabel(row.diff)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

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
