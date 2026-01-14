import React, { useState } from "react";
import "./CreateGoalModal.css";
import { createGoal } from "../../../../services/goals.service";

export default function CreateGoalModal({ isOpen, onClose, goals, onSuccess }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    // Frontend duplicate prevention: same name
    const alreadyExists = Array.isArray(goals) && goals.some(
      (g) => g?.name?.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      alert("A goal with this name already exists. Please choose a different name.");
      return;
    }

    try {
      setLoading(true);
      const newGoal = await createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate
      });

      if (onSuccess) {
        onSuccess(newGoal);
      }

      setName("");
      setTargetAmount("");
      setTargetDate("");
      onClose();
    } catch (err) {
      console.error("Error creating goal:", err);
      setError(err.message || "Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-goal-overlay" onClick={handleCancel}>
      <div className="create-goal-content" onClick={(e) => e.stopPropagation()}>
        <div className="create-goal-header">
          <h2>Create New Goal</h2>
          <button className="create-goal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-goal-form">
          {error && <div className="create-goal-error">{error}</div>}

          <div className="create-goal-field">
            <label htmlFor="name">Goal Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vacation, Emergency Fund"
              required
              disabled={loading}
            />
          </div>

          <div className="create-goal-field">
            <label htmlFor="targetAmount">Target Amount (₹) *</label>
            <input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Enter target amount"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="create-goal-field">
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

          <div className="create-goal-actions">
            <button
              type="button"
              className="create-goal-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-goal-btn-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
