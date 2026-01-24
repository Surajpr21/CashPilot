import React from "react";
import "./InsuranceCard.css";

export default function InsuranceCard() {
  return (
    <div className="assets-page-card">
      <h3>Insurance</h3>

      <div className="assets-page-row">
        <span>Policies covered</span>
        <strong>3 active</strong>
      </div>

      <p>Premiums paid till date: ₹2,35,500</p>
      <p className="assets-page-muted">Coverage: Health, term life, vehicle</p>

      <button type="button" className="assets-page-link">
        View premium history 
      </button>
    </div>
  );
}
