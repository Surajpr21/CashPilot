import React, { useState, useEffect } from "react";
import "./EditGoalModal.css";
import { updateGoal } from "../../../../services/goals.service";

export default function EditGoalModal({ isOpen, onClose, goal, onSuccess }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load goal data when modal opens
  useEffect(() => {
    if (isOpen && goal) {
      setName(goal.name || "");
      setTargetAmount(goal.target_amount || "");
      setTargetDate(goal.target_date || "");
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !targetAmount || !targetDate) {
      setError("Please fill in all fields");
      return;
    }

    if (parseFloat(targetAmount) <= 0) {
      setError("Target amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      await updateGoal(goal.id, {
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Error updating goal:", err);
      setError(err.message || "Failed to update goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="edit-goal-overlay" onClick={handleCancel}>
      <div className="edit-goal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-goal-header">
          <h2>Edit Goal</h2>
          <button className="edit-goal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-goal-form">
          {error && <div className="edit-goal-error">{error}</div>}

          <div className="edit-goal-field">
            <label htmlFor="name">Goal Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name"
              required
              disabled={loading}
            />
          </div>

          <div className="edit-goal-field">
            <label htmlFor="targetAmount">Target Amount (₹) *</label>
            <input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Target amount"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="edit-goal-field">
            <label htmlFor="targetDate">Target Date *</label>
            <input
              type="date"
              id="targetDate"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <p className="edit-goal-info">
            💡 You can only edit the goal name, target amount, and target date. 
            The current saved amount and status are managed automatically.
          </p>

          <div className="edit-goal-actions">
            <button
              type="button"
              className="edit-goal-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-goal-btn-submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
