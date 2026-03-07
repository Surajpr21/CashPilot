import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import "./InsuranceCard.css";

export default function InsuranceCard({ totalPremiums, currency, policiesCount, onViewHistory }) {
  return (
    <div className="assets-page-card">
      <h3>Insurance</h3>

      <div className="assets-page-row">
        <span>Policies covered</span>
        <strong>{policiesCount ? formatNumber(policiesCount) : "—"}</strong>
      </div>

      <p>Premiums paid till date: ₹ {formatCurrency(totalPremiums)}</p>
      <p className="assets-page-muted">Read-only values from insurance view</p>

      {onViewHistory ? (
        <button type="button" className="insurance-learn-more" onClick={onViewHistory}>
          <span className="circle" aria-hidden="true">
            <span className="icon arrow" />
          </span>
          <span className="button-text">Know more</span>
        </button>
      ) : null}
    </div>
  );
}
