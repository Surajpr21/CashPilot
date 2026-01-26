import React from "react";
import "./SummaryCards.css";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";

export default function SummaryCards({
  totalAssets,
  investmentsTotal,
  goldValue,
  goldGrams,
  insuranceTotal,
  assetsCurrency,
  investmentsCurrency,
  goldCurrency,
  insuranceCurrency,
  goldMarketPricePerGram,
  goldMarketCurrency,
}) {
  return (
    <div className="assets-page-summary">
      <div className="assets-page-summary-card">
        <p>Total Assets</p>
        <h2>{formatCurrency(totalAssets, assetsCurrency)}</h2>
        <span>Across investments, gold & insurance.</span>
      </div>

      <div className="assets-page-summary-card">
        <p>Invested Amount</p>
        <h2>{formatCurrency(investmentsTotal, investmentsCurrency || assetsCurrency)}</h2>
        <span>Long-term investments</span>
        <small className="assets-page-muted">Excludes gold & insurance</small>
      </div>

      <div className="assets-page-summary-card">
        <p>Gold Holdings</p>
        <h2>{formatNumber(goldGrams)} g</h2>
        <small>{formatCurrency(goldValue, goldCurrency || assetsCurrency)} total value</small>
        {goldMarketPricePerGram ? (
          <small>
            Market price {formatCurrency(goldMarketPricePerGram, goldMarketCurrency || goldCurrency || assetsCurrency)} / g
          </small>
        ) : null}
      </div>

      <div className="assets-page-summary-card">
        <p>Insurance Premiums Paid</p>
        <h2>{formatCurrency(insuranceTotal, insuranceCurrency || assetsCurrency)}</h2>
        <span>Lifetime premiums paid</span>
      </div>
    </div>
  );
}
