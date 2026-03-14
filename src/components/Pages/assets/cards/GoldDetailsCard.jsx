import React from "react";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
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

export default function GoldDetailsCard({ metalHoldings = [], onAdd, onViewMore }) {
  const rows = Array.isArray(metalHoldings) ? metalHoldings : [];
  const visibleRows = rows.slice(0, 2);
  const hasMore = rows.length > 2;

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <div className="assets-page-card-heading">
          <span className="assets-page-card-icon assets-page-card-icon-metals" aria-hidden="true">
            <HugeiconsIcon icon={SparklesIcon} size={25} strokeWidth={1.9} color="#f59e0b" />
          </span>
          <h3>Precious Metals</h3>
        </div>
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
          {visibleRows.map((metal) => {
            const label = METAL_LABELS[metal?.metal_type] || "Other";
            const grams = formatNumber(metal?.total_grams ?? 0);
            const avgPrice = metal?.avg_buy_price;
            const purchasedAt = metal?.purchased_at;
            const purchasedAtText = purchasedAt
              ? new Date(purchasedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;
            const avgPriceText =
              avgPrice === null || avgPrice === undefined ? "—" : `₹ ${formatCurrency(avgPrice)} / g`;

            return (
              <div className="assets-page-row" key={`${metal?.metal_type}-${grams}`}>
                <div>
                  <span>{label}</span>
                  {purchasedAtText ? <div className="assets-page-muted">Purchased {purchasedAtText}</div> : null}
                </div>
                <div style={{gap:"5px"}} className="assets-page-row-meta">
                  <span>{grams} g</span>
                  <span className="assets-page-muted">avg {avgPriceText}</span>
                </div>
                
              </div>
              
            );
          })}
            <p style={{marginBottom:"10px"}} className="assets-page-muted">Quantity-based assets; no totals or pricing applied.</p>
        </div>
      )}

      {onViewMore && hasMore ? (
        <button type="button" className="insurance-learn-more" onClick={onViewMore}>
          <span className="circle" aria-hidden="true">
            <span className="icon arrow" />
          </span>
          <span className="button-text">Know more</span>
        </button>
      ) : null}

    
    </div>
  );
}
