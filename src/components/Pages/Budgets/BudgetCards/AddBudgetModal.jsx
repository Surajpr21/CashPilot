import React, { useState } from "react";
import "./AddBudgetModal.css";
import { addBudget, addBudgetRPC } from "../../../../services/budgets.service";
import { CATEGORIES } from "../../../../constants/categories";

export default function AddBudgetModal({ isOpen, onClose, currentMonth, budgets, onSuccess }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!category || !amount || amount <= 0) {
      setError("Please fill in all fields with valid values");
      return;
    }

    // Frontend duplicate prevention: same category + month
    try {
      const alreadyExists = Array.isArray(budgets) && budgets.some(
        (b) => b?.category === category && b?.month === currentMonth
      );
      if (alreadyExists) {
        alert("Budget already exists for this category this month. You can edit it instead.");
        return;
      }
    } catch {}

    try {
      setLoading(true);
      let newBudget;
      // Prefer RPC that sets user_id server-side
      try {
        newBudget = await addBudgetRPC({
          category,
          month: currentMonth,
          amount: parseFloat(amount),
        });
      } catch (rpcErr) {
        // Fallback to direct insert if RPC isn't configured
        newBudget = await addBudget({
          category,
          month: currentMonth,
          amount: parseFloat(amount),
        });
      }

      // Call success callback to refresh parent data
      if (onSuccess) {
        onSuccess(newBudget);
      }

      // Reset form and close modal
      setCategory("");
      setAmount("");
      onClose();
    } catch (err) {
      console.error("Error adding budget:", err);
      setError(err.message || "Failed to add budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCategory("");
    setAmount("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="budget-modal-overlay" onClick={handleCancel}>
      <div className="budget-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="budget-modal-header">
          <h2>Add New Budget</h2>
          <button className="budget-modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="budget-modal-form">
          {error && <div className="budget-modal-error">{error}</div>}

          <div className="budget-modal-field">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="budget-modal-field">
            <label htmlFor="amount">Budget Amount (₹) *</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter budget amount"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="budget-modal-field">
            <label>Month</label>
            <input
              type="text"
              value={new Date(currentMonth).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
              disabled
              className="budget-modal-readonly"
            />
          </div>

          <div className="budget-modal-actions">
            <button
              type="button"
              className="budget-modal-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="budget-modal-btn-submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
