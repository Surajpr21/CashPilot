import React from "react";
import { useQuery } from "@tanstack/react-query";
import "./InvestmentsCard.css";
import { formatCurrency } from "../../../../lib/formatters";
import { getInvestmentsDetails } from "../../../../lib/api/assets.api";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoneyBag02Icon } from "@hugeicons/core-free-icons";

const TYPE_LABELS = {
  mutual_fund: "Mutual Fund",
  stock: "Stock",
  fixed_deposit: "Fixed Deposit",
  recurring_deposit: "Recurring Deposit",
  other: "Other",
};

export default function InvestmentsCard({ total, currency, onAdd, onViewMore }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["investments-details"],
    queryFn: getInvestmentsDetails,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const investments = Array.isArray(data) ? data : [];
  const visibleInvestments = investments.slice(0, 4);
  const hasMore = investments.length > 4;

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <div className="assets-page-card-heading">
          <span className="assets-page-card-icon assets-page-card-icon-investments" aria-hidden="true">
            <HugeiconsIcon icon={MoneyBag02Icon} size={20} strokeWidth={1.9} color="#10b981" />
          </span>
          <h3>Investments</h3>
        </div>
        {onAdd ? (
          <button className="assets-page-add-btn" onClick={onAdd} type="button">
            + Add investment
          </button>
        ) : null}
      </div>

      <div className="assets-page-row">
        <span>Total invested</span>
        <span>₹ {formatCurrency(total)}</span>
      </div>

      <p style={{marginTop:"-10px"}} className="assets-page-muted">Includes all instruments synced from the backend views.</p>

      {isLoading ? <p className="assets-page-muted">Loading investments…</p> : null}
      {isError ? <p className="assets-page-muted">Unable to load investments.</p> : null}

      {!isLoading && !isError ? (
        visibleInvestments.length ? (
          <ul className="assets-page-list">
            {visibleInvestments.map((inv) => (
              <li key={inv.id}>
                <div>
                  <span>{inv.name || "Untitled"}</span>
                  <div className="assets-page-muted">{TYPE_LABELS[inv.investment_type] || "Other"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span>₹ {formatCurrency(inv.amount_invested)}</span>
                  {inv.created_at ? (
                    <div className="assets-page-muted">
                      {new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="assets-page-muted">No investments yet.</p>
        )
      ) : null}

      {onViewMore && hasMore ? (
        <button type="button" className="assets-page-link" onClick={onViewMore}>
          Know more →
        </button>
      ) : null}
    </div>
  );
}
