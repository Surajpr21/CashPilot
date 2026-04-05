import React, { useState } from "react";
import "./AddBudgetModal.css";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";
import { addBudget, addBudgetRPC } from "../../../../services/budgets.service";
import { CATEGORIES } from "../../../../constants/categories";

export default function AddBudgetModal({ isOpen, onClose, currentMonth, budgets, onSuccess }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = CATEGORIES.map((cat) => ({ value: cat, label: cat }));

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
          <h2>Add Budget</h2>
          <button className="budget-modal-close" onClick={handleCancel} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="budget-modal-form">
          {error && <div className="budget-modal-error">{error}</div>}

          <div className="budget-modal-grid">
            <div className="budget-modal-field">
              <label htmlFor="category">Category *</label>
              <CustomDropdown
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                placeholder="Select category"
                width="100%"
                menuMaxHeight="260px"
                disabled={loading}
                disableShine
                disableBounce
              />
            </div>

            <div className="budget-modal-field">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="budget-modal-field budget-modal-span-2 budget-modal-helper">
              <span className="budget-modal-helper-label">Month</span>
              <span className="budget-modal-helper-text">
                Budget will be added for {new Date(currentMonth).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
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
              {loading ? "Adding..." : "Save Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
