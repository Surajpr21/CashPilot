import React from "react";
import "./SummaryCards.css";

export default function SummaryCards() {
  return (
    <div className="assets-page-summary">
      <div className="assets-page-summary-card">
        <p>Total Assets</p>
        <h2>₹8,75,500</h2>
        <span>Across investments, gold & insurance.</span>
      </div>

      <div className="assets-page-summary-card">
        <p>Invested Amount</p>
        <h2>₹6,40,000</h2>
        <span>Long-term investments</span>
        <small className="assets-page-muted">Excludes gold & insurance</small>
      </div>

      <div className="assets-page-summary-card">
        <p>Gold Holdings</p>
        <h2>75 g</h2>
        <span className="positive">↑ 0.8%</span>
        <small>Market price ₹6,080/g ↑</small>
      </div>

      <div className="assets-page-summary-card">
        <p>Insurance Premiums Paid</p>
        <h2>₹2,35,500</h2>
        <span>Lifetime premiums paid</span>
      </div>
    </div>
  );
}
