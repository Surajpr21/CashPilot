import React, { useEffect, useState } from "react";
import "./InvestmentsCard.css";

export default function AddMetalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [metalType, setMetalType] = useState("");
  const [grams, setGrams] = useState("");
  const [buyPricePerGram, setBuyPricePerGram] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMetalType("");
      setGrams("");
      setBuyPricePerGram("");
      setPurchasedAt("");
      setFormError("");
    } else {
      setFormError("");
      setPurchasedAt((prev) => prev || new Date().toISOString().split("T")[0]);
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

    const gramsNumber = parseFloat(grams);
    const buyPriceNumber = buyPricePerGram === "" ? undefined : parseFloat(buyPricePerGram);
    const dateValue = purchasedAt?.trim();

    if (!metalType) {
      setFormError("Select a metal type.");
      return;
    }

    if (Number.isNaN(gramsNumber) || gramsNumber <= 0) {
      setFormError("Quantity must be greater than 0 grams.");
      return;
    }

    if (buyPricePerGram !== "" && (Number.isNaN(buyPriceNumber) || buyPriceNumber < 0)) {
      setFormError("Buy price per gram must be zero or more.");
      return;
    }

    if (!dateValue) {
      setFormError("Purchase date is required.");
      return;
    }

    try {
      await onSubmit({
        metal_type: metalType,
        grams: gramsNumber,
        buy_price_per_gram: buyPriceNumber,
        purchased_at: dateValue,
      });
    } catch (err) {
      setFormError(err?.message || "Unable to add metal holding. Please try again.");
    }
  };

  return (
    <div className="assets-page-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div>
            <p className="assets-page-modal-kicker">New holding</p>
            <h4>Add Precious Metal</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={handleClose}
            aria-label="Close add metal"
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
              <label htmlFor="metal-type">Metal type *</label>
              <select
                id="metal-type"
                name="metal-type"
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Select metal</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
                <option value="palladium">Palladium</option>
                <option value="diamond">Diamond</option>
                <option value="jewelry">Other jewellery</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="metal-grams">Quantity (g) *</label>
              <input
                id="metal-grams"
                name="metal-grams"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span className="assets-page-hint">Must be greater than 0; decimals allowed.</span>
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="metal-buy-price">Buy price per gram (optional)</label>
              <input
                id="metal-buy-price"
                name="metal-buy-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={buyPricePerGram}
                onChange={(e) => setBuyPricePerGram(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="metal-purchase-date">Purchase date *</label>
              <input
                id="metal-purchase-date"
                name="metal-purchase-date"
                type="date"
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="assets-page-form-note">
            <p>Tracks physical metals in grams; no currency or derived totals are entered here.</p>
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
              {isSubmitting ? "Saving..." : "Add metal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
