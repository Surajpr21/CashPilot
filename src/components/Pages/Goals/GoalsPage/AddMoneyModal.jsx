import React, { useState } from "react";
import "./AddMoneyModal.css";
import { addMoneyToGoal, fetchGoals } from "../../../../services/goals.service";

export default function AddMoneyModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setLoading(true);
      await addMoneyToGoal({
        goalId: goal.id,
        amount: parseFloat(amount),
        note: note.trim()
      });

      // Refresh goals to get updated saved_amount and status
      const updatedGoals = await fetchGoals();
      if (onSuccess) {
        onSuccess(updatedGoals);
      }

      // Reset and close
      setAmount("");
      setNote("");
      onClose();
    } catch (err) {
      console.error("Error adding money to goal:", err);
      setError(err.message || "Failed to add money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount("");
    setNote("");
    setError("");
    onClose();
  };

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.target_amount - (goal.saved_amount || 0));

  return (
    <div className="add-money-overlay" onClick={handleCancel}>
      <div className="add-money-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-money-header">
          <h2>Add Money to Goal</h2>
          <button className="add-money-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="add-money-goal-info">
          <p className="add-money-goal-name">{goal.name}</p>
          <p className="add-money-goal-progress">
            ₹{(goal.saved_amount || 0).toLocaleString()} of ₹{goal.target_amount.toLocaleString()} 
            <span className="add-money-remaining">
              (₹{remaining.toLocaleString()} remaining)
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="add-money-form">
          {error && <div className="add-money-error">{error}</div>}

          <div className="add-money-field">
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

          <div className="add-money-field">
            <label htmlFor="note">Note (Optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (e.g., monthly savings)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="add-money-actions">
            <button
              type="button"
              className="add-money-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-money-btn-submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Money"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
