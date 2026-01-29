import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import "./GoldDetailsCard.css";

const METAL_LABELS = {
  gold: "Gold",
  silver: "Silver",
  platinum: "Platinum",
  palladium: "Palladium",
  diamond: "Diamond",
  jewelry: "Other jewellery",
  other: "Other",
};

export default function GoldDetailsCard({ metalHoldings = [], onAdd }) {
  const rows = Array.isArray(metalHoldings) ? metalHoldings : [];

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3>Precious Metals</h3>
        {onAdd ? (
          <button className="assets-page-add-btn" onClick={onAdd} type="button">
            + Add metal
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="assets-page-muted">No metal holdings yet. Add your first lot.</p>
      ) : (
        <div className="assets-page-list">
          {rows.map((metal) => {
            const label = METAL_LABELS[metal?.metal_type] || "Other";
            const grams = formatNumber(metal?.total_grams ?? 0);
            const avgPrice = metal?.avg_buy_price;
            const avgPriceText =
              avgPrice === null || avgPrice === undefined ? "—" : `₹ ${formatCurrency(avgPrice)} / g`;

            return (
              <div className="assets-page-row" key={`${metal?.metal_type}-${grams}`}>
                <div>
                  <strong>{label}</strong>
                </div>
                <div className="assets-page-row-meta">
                  <span>{grams} g</span>
                  <span className="assets-page-muted">avg {avgPriceText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="assets-page-muted">Quantity-based assets; no totals or pricing applied.</p>
    </div>
  );
}
