import React, { useState } from "react";
import { addSubscription, updateSubscription } from "../../../../../services/subscriptions";
import "./SubscriptionForm.css";

const initialState = {
  name: "",
  amount: "",
  billing_cycle: "monthly",
  next_billing_date: "",
  category: "entertainment",
  payment_method: "card",
};

export default function SubscriptionForm({ onClose, onSubscriptionAdded, editMode = false, subscription = null }) {
  const [form, setForm] = useState(
    editMode && subscription
      ? {
          name: subscription.name || "",
          amount: subscription.amount || "",
          billing_cycle: subscription.billing_cycle || "monthly",
          next_billing_date: subscription.next_due || "",
          category: subscription.category || "entertainment",
          payment_method: subscription.payment_method || "card",
        }
      : initialState
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        amount: form.amount ? Number(form.amount) : 0,
        category: form.category,
        billing_cycle: form.billing_cycle,
        next_due: form.next_billing_date,
        payment_method: form.payment_method || null,
      };

      if (editMode && subscription) {
        await updateSubscription(subscription.id, payload);
        setSuccess("Subscription updated");
      } else {
        await addSubscription(payload);
        setSuccess("Subscription added");
        setForm(initialState);
      }

      if (onSubscriptionAdded) onSubscriptionAdded();

      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="subs-form" onSubmit={handleSubmit}>
      <div className="subs-form-header">
        <h3>{editMode ? "Edit Subscription" : "Add Subscription"}</h3>
        {onClose && (
          <button
            type="button"
            className="subs-form-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>

      <div className="subs-form-grid">
        {/* 1) Subscription Name */}
        <label className="subs-form-field">
          <span>Subscription Name</span>
          <input
            type="text"
            name="name"
            placeholder="Netflix"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        {/* 2) Amount */}
        <label className="subs-form-field">
          <span>Amount</span>
          <div className="subs-amount-input">
            <span className="subs-amount-prefix">₹</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              placeholder="499"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
        </label>

        {/* 3) Billing Cycle */}
        <label className="subs-form-field">
          <span>Billing Cycle</span>
          <select
            name="billing_cycle"
            value={form.billing_cycle}
            onChange={handleChange}
            required
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        {/* 4) Next Billing Date */}
        <label className="subs-form-field">
          <span>Next Billing Date</span>
          <input
            type="date"
            name="next_billing_date"
            value={form.next_billing_date}
            onChange={handleChange}
            required
          />
        </label>

        {/* 5) Category */}
        <label className="subs-form-field">
          <span>Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="productivity">Productivity</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
          </select>
        </label>

        {/* 6) Payment Method (not shown in table, but saved) */}
        <label className="subs-form-field">
          <span>Payment Method</span>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            required
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="subs-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editMode ? "Update Subscription" : "Save Subscription"}
        </button>
      </div>

      {error && <div className="subs-form-error">{error}</div>}
      {success && <div className="subs-form-success">{success}</div>}
    </form>
  );
}
