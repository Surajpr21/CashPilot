import React, { useState } from "react";
import { addExpense } from "../../../../../services/expenses.service";
import { supabase } from "../../../../../lib/supabaseClient";
import "./ExpenseForm.css";

const initialState = {
  spent_at: "",
  title: "",
  category: "",
  amount: "",
  payment_mode: "",
};

export default function ExpenseForm({ onClose, onExpenseAdded }) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in to add expenses");
        setLoading(false);
        return;
      }

      const payload = {
        ...formState,
        amount: formState.amount ? Number(formState.amount) : "",
        sub_category: null,
        user_id: user.id,
      };

      const { data, error: submitError } = await addExpense(payload);
      if (submitError) {
        setError(submitError.message);
      } else {
        setSuccess("Expense added successfully");
        setFormState(initialState);
        // Trigger refetch in parent
        if (onExpenseAdded) {
          onExpenseAdded();
        }
        // Optionally close the form after success
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="expense-form-header">
        <h3>Add Expense</h3>
        {onClose && (
          <button
            type="button"
            className="expense-form-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>

      <div className="expense-form-grid">
        <label className="expense-form-field">
          <span>Date</span>
          <input
            type="date"
            name="spent_at"
            value={formState.spent_at}
            onChange={handleChange}
            required
          />
        </label>

        <label className="expense-form-field">
          <span>Title / Note</span>
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={handleChange}
            placeholder="Groceries at market"
            required
          />
        </label>

        <label className="expense-form-field">
          <span>Category</span>
          <input
            type="text"
            name="category"
            value={formState.category}
            onChange={handleChange}
            placeholder="Food"
            required
          />
        </label>

        <label className="expense-form-field">
          <span>Amount</span>
          <input
            type="number"
            name="amount"
            value={formState.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </label>

        <label className="expense-form-field">
          <span>Mode of Payment</span>
          <select
            name="payment_mode"
            value={formState.payment_mode}
            onChange={handleChange}
            required
          >
            <option value="">Select mode</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="expense-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </div>

      {error && <div className="expense-form-error">{error}</div>}
      {success && <div className="expense-form-success">{success}</div>}
    </form>
  );
}
