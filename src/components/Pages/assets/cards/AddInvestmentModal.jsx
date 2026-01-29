import React, { useEffect, useState } from "react";
import "./InvestmentsCard.css";

const INVESTMENT_TYPES = [
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Stock", value: "stock" },
  { label: "Fixed Deposit (FD)", value: "fixed_deposit" },
  { label: "Recurring Deposit (RD)", value: "recurring_deposit" },
  { label: "Other", value: "other" },
];

export default function AddInvestmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [name, setName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setInvestmentType("");
      setAmount("");
      setFormError("");
    } else {
      setFormError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedName = name.trim();
    const amountNumber = parseFloat(amount);
    const currency = "INR";

    if (!trimmedName) {
      setFormError("Enter an investment name.");
      return;
    }

    if (!investmentType) {
      setFormError("Select an investment type.");
      return;
    }

    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      setFormError("Amount invested must be zero or more.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        investment_type: investmentType,
        amount_invested: amountNumber,
        currency,
      });
    } catch (err) {
      setFormError(err?.message || "Unable to add investment. Please try again.");
    }
  };

  return (
    <div className="assets-page-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div>
            <p className="assets-page-modal-kicker">New investment</p>
            <h4>Add investment</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={handleClose}
            aria-label="Close add investment"
          >
            ×
          </button>
        </div>

        <form className="assets-page-form" onSubmit={handleSubmit}>
          {formError || errorMessage ? (
            <div className="assets-page-form-error">{formError || errorMessage}</div>
          ) : null}

          <div className="assets-page-form-grid">
            <div className="assets-page-form-row">
              <label htmlFor="investment-name">Investment name *</label>
              <input
                id="investment-name"
                name="investment-name"
                type="text"
                placeholder="Nifty 50 Index Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="investment-type">Investment type *</label>
              <select
                id="investment-type"
                name="investment-type"
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Select type</option>
                {INVESTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <span className="assets-page-hint">Values map directly to the enum in Supabase.</span>
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="investment-amount">Amount invested *</label>
              <input
                id="investment-amount"
                name="investment-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="investment-currency">Currency</label>
              <input
                id="investment-currency"
                name="investment-currency"
                type="text"
                value="INR"
                readOnly
                disabled
              />
              <span className="assets-page-hint">Locked to INR; does not hit cash balance.</span>
            </div>
          </div>

          <div className="assets-page-form-note">
            <p>Records long-term investments only. Account balance is unchanged.</p>
          </div>

          <div className="assets-page-modal-actions">
            <button
              type="button"
              className="assets-page-btn ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="assets-page-btn primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
