import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import { HugeiconsIcon } from "@hugeicons/react";
import { RupeeShieldIcon } from "@hugeicons/core-free-icons";
import "./InsuranceCard.css";

export default function InsuranceCard({ totalPremiums, currency, policiesCount, onViewHistory }) {
  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <div className="assets-page-card-heading">
          <span className="assets-page-card-icon assets-page-card-icon-insurance" aria-hidden="true">
            <HugeiconsIcon icon={RupeeShieldIcon} size={20} strokeWidth={1.9} color="#ef4444" />
          </span>
          <h3>Insurance</h3>
        </div>
      </div>

      <div className="assets-page-row">
        <span>Policies covered</span>
        <span>{policiesCount ? formatNumber(policiesCount) : "—"}</span>
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
