import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import "./InsuranceCard.css";

export default function InsuranceCard({ totalPremiums, currency, policiesCount, onViewHistory }) {
  return (
    <div className="assets-page-card">
      <h3>Insurance</h3>

      <div className="assets-page-row">
        <span>Policies covered</span>
        <strong>{policiesCount ? `${formatNumber(policiesCount)} active` : "—"}</strong>
      </div>

      <p>Premiums paid till date: {formatCurrency(totalPremiums, currency)}</p>
      <p className="assets-page-muted">Read-only values from insurance view</p>

      {onViewHistory ? (
        <button type="button" className="assets-page-link" onClick={onViewHistory}>
          View premium history →
        </button>
      ) : null}
    </div>
  );
}
