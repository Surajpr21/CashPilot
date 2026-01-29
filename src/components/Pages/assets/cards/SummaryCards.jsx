import React from "react";
import "./SummaryCards.css";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";

export default function SummaryCards({
  totalAssets,
  investmentsTotal,
  insuranceTotal,
  insurancePoliciesCovered,
  assetsCurrency,
  investmentsCurrency,
  insuranceCurrency,
  metalTypeCount,
}) {
  return (
    <div className="assets-page-summary">
      <div className="assets-page-summary-card">
        <p>Total Assets</p>
        <h2>₹ {formatCurrency(totalAssets)}</h2>
        <span>Across investments & insurance.</span>
      </div>

      <div className="assets-page-summary-card">
        <p>Invested Amount</p>
        <h2>₹ {formatCurrency(investmentsTotal)}</h2>
        <span>Long-term investments</span>
        <small className="assets-page-muted">Excludes gold & insurance</small>
      </div>

      <div className="assets-page-summary-card">
        <p>Precious Metals</p>
        <h2>{formatNumber(metalTypeCount)} types</h2>
        <small>Quantity-based assets</small>
      </div>

      <div className="assets-page-summary-card">
        <p>Insurance Premiums Paid</p>
        <h2>₹ {formatCurrency(insuranceTotal)}</h2>
        <span>Policies covered: {formatNumber(insurancePoliciesCovered)}</span>
      </div>
    </div>
  );
}
