import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import "./GoldDetailsCard.css";

export default function GoldDetailsCard({
  totalGrams,
  totalValue,
  averageBuyPrice,
  currency,
  marketPricePerGram,
  marketCurrency,
  onAdd,
  onViewHistory,
}) {
  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3>Gold</h3>
        {onAdd ? (
          <button className="assets-page-add-btn" onClick={onAdd} type="button">
            + Add gold
          </button>
        ) : null}
      </div>

      <div className="assets-page-row">
        <span>Total gold</span>
        <strong>
          {formatNumber(totalGrams)} g • {formatCurrency(totalValue, currency)}
        </strong>
      </div>

      <p>Avg buy price: {formatCurrency(averageBuyPrice, currency)} / g</p>
      <p className="assets-page-muted">Adds to assets and invested amount; no client-side math.</p>
      {marketPricePerGram ? (
        <p className="positive">
          Market price: {formatCurrency(marketPricePerGram, marketCurrency || currency)} / g
        </p>
      ) : null}

      {onViewHistory ? (
        <button type="button" className="assets-page-link" onClick={onViewHistory}>
          View price history →
        </button>
      ) : null}
    </div>
  );
}
