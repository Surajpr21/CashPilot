import React from "react";
import "./SummaryCards.css";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import {
  WalletIcon,
  BanknotesIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-assets" aria-hidden="true">
            <WalletIcon />
          </span>
          <p>Total Assets</p>
        </div>
        <h2>₹ {formatCurrency(totalAssets)}</h2>
        <span>Across investments & insurance.</span>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-investments" aria-hidden="true">
            <BanknotesIcon />
          </span>
          <p>Invested Amount</p>
        </div>
        <h2>₹ {formatCurrency(investmentsTotal)}</h2>
        <span>Long-term investments</span>
        <small className="assets-page-muted"> Excludes gold & insurance</small>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-metals" aria-hidden="true">
            <SparklesIcon />
          </span>
          <p>Precious Metals</p>
        </div>
        <h2>{formatNumber(metalTypeCount)} types</h2>
        <small>Quantity-based assets</small>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-insurance" aria-hidden="true">
            <ShieldCheckIcon />
          </span>
          <p>Insurance Premiums Paid</p>
        </div>
        <h2>₹ {formatCurrency(insuranceTotal)}</h2>
        <span>Policies covered: {formatNumber(insurancePoliciesCovered)}</span>
      </div>
    </div>
  );
}
