import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { updateBudgetAmount } from "../../../../services/budgets.service";

const ROWS_PER_PAGE = 3;
const CARDS_PER_ROW = 3;
const ITEMS_PER_PAGE = ROWS_PER_PAGE * CARDS_PER_ROW;

export default function CategoryBreakdownContainer({
  rows,
  loading,
  currentMonth,
  setBudgets,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, currentMonth]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const getProgressLabel = (diff) => {
    if (diff > 0) return `exceeded ${formatCurrency(diff)}`;
    if (diff < 0) return `saved ${formatCurrency(Math.abs(diff))}`;
    return "on track";
  };

  const getRowInsight = (row) => {
    if (row.diff > 0) {
      return {
        text: `${row.category} exceeded budget by ${formatCurrency(row.diff)}`,
        tone: "warn",
      };
    }

    if (row.diff < 0) {
      return {
        text: `${row.category} saved ${formatCurrency(Math.abs(row.diff))} this month`,
        tone: "good",
      };
    }

    return null;
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

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageRows = rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bVa-page-category-container">
      <h2 className="bVa-page-section-title">Category-wise Breakdown</h2>

      {/* STEP 6: Render budget bars from merged rows */}
      <div className="bVa-page-category-grid">
        {pageRows.map((row) => {
          const rowInsight = getRowInsight(row);

          return (
            <div key={row.id} className="bVa-page-category-row">
            <div className="bVa-row-top">
              <div className="bVa-page-category-main">
                <div className="bVa-page-category-title">{row.category}</div>
                <div className="bVa-page-category-sub">
                  {formatCurrency(row.planned)} Budget • {formatCurrency(row.actual)} Actual
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
                Budget {formatCurrency(row.planned)}
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
              {rowInsight && (
                <div
                  className={`bVa-row-insight ${
                    rowInsight.tone === "good" ? "bVa-insight-good" : "bVa-insight-warn"
                  }`}
                >
                  {rowInsight.tone === "good" ? (
                    <CheckCircleIcon className="bVa-insight-icon" />
                  ) : (
                    <ExclamationTriangleIcon className="bVa-insight-icon" />
                  )}
                  <span>{rowInsight.text}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="bVa-page-pagination">
          <button
            className="bVa-page-pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safePage === 1}
          >
            Previous
          </button>
          <span className="bVa-page-pagination-info">
            Page {safePage} of {totalPages}
          </span>
          <button
            className="bVa-page-pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
