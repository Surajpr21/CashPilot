import React, { useMemo, useState } from "react";
import "./GoldDetailsCard.css";

export default function GoldDetailsCard() {
  const [showForm, setShowForm] = useState(false);
  const [grams, setGrams] = useState("10");
  const [pricePerGram, setPricePerGram] = useState("5800");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [source, setSource] = useState("Jeweller");
  const [goldType, setGoldType] = useState("Coin/Bar");

  const total = useMemo(() => {
    const g = Number(grams) || 0;
    const p = Number(pricePerGram) || 0;
    return g * p;
  }, [grams, pricePerGram]);

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3>Gold</h3>
        <button className="assets-page-add-btn" onClick={() => setShowForm(true)}>
          + Add gold
        </button>
      </div>

      <div className="assets-page-row">
        <span>Total gold: 75 grams</span>
        <strong>₹2,35,500</strong>
      </div>

      <p>Avg buy price: ₹5,800/g</p>
      <p className="positive">Market price today: ₹6,080/g +0.8%</p>
      <p className="assets-page-muted">Market price shown for reference only</p>

        <button type="button" className="assets-page-link" onClick={() => setShowForm(true)}>
          View price history →
        </button>

      {showForm && (
        <div
          className="assets-page-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowForm(false)}
        >
          <div className="assets-page-modal" onClick={e => e.stopPropagation()}>
            <div className="assets-page-modal-header">
              <div>
                <p className="assets-page-modal-kicker">Add gold</p>
                <h4>Track gold as an asset</h4>
              </div>
              <button
                className="assets-page-modal-close"
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="assets-page-form">
              <div className="assets-page-form-grid">
                <div className="assets-page-form-row">
                  <label>Gold type</label>
                  <select value={goldType} onChange={e => setGoldType(e.target.value)}>
                    <option>Coin/Bar</option>
                    <option>Jewellery</option>
                    <option>Digital / ETF</option>
                  </select>
                </div>
                <div className="assets-page-form-row">
                  <label>Weight (grams)</label>
                  <input value={grams} onChange={e => setGrams(e.target.value)} />
                </div>
                <div className="assets-page-form-row">
                  <label>Buy price per gram</label>
                  <input value={pricePerGram} onChange={e => setPricePerGram(e.target.value)} />
                </div>
                <div className="assets-page-form-row">
                  <label>Purchase date</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <div className="assets-page-form-row">
                  <label>Source</label>
                  <select value={source} onChange={e => setSource(e.target.value)}>
                    <option>Jeweller</option>
                    <option>Bank</option>
                    <option>Broker / ETF</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <p className="assets-page-muted">Total invested: ₹{total.toLocaleString()} (grams × buy price)</p>
              <p className="assets-page-muted">
                Adds to Assets and Invested Amount; does not create expenses or touch savings.
              </p>

              <div className="assets-page-modal-actions">
                <button type="button" className="assets-page-btn ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="button" className="assets-page-btn primary">
                  Save gold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
