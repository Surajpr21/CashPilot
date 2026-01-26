import React from "react";
import "./InvestmentsCard.css";
import { formatCurrency } from "../../../../lib/formatters";

export default function InvestmentsCard({ total, currency, onAdd }) {
  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3>Investments</h3>
        {onAdd ? (
          <button className="assets-page-add-btn" onClick={onAdd} type="button">
            + Add investment
          </button>
        ) : null}
      </div>

      <div className="assets-page-row">
        <span>Total invested</span>
        <strong>{formatCurrency(total, currency)}</strong>
      </div>

      <p className="assets-page-muted">Includes all instruments synced from the backend views.</p>
    </div>
  );
}
