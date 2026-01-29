import React from "react";
import { useQuery } from "@tanstack/react-query";
import "./InvestmentsCard.css";
import { formatCurrency } from "../../../../lib/formatters";
import { getInvestmentsDetails } from "../../../../lib/api/assets.api";

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
        <h3>Investments</h3>
        {onAdd ? (
          <button className="assets-page-add-btn" onClick={onAdd} type="button">
            + Add investment
          </button>
        ) : null}
      </div>

      <div className="assets-page-row">
        <span>Total invested</span>
        <strong>₹ {formatCurrency(total)}</strong>
      </div>

      <p className="assets-page-muted">Includes all instruments synced from the backend views.</p>

      {isLoading ? <p className="assets-page-muted">Loading investments…</p> : null}
      {isError ? <p className="assets-page-muted">Unable to load investments.</p> : null}

      {!isLoading && !isError ? (
        visibleInvestments.length ? (
          <ul className="assets-page-list">
            {visibleInvestments.map((inv) => (
              <li key={inv.id}>
                <div>
                  <strong>{inv.name || "Untitled"}</strong>
                  <div className="assets-page-muted">{TYPE_LABELS[inv.investment_type] || "Other"}</div>
                </div>
                <strong>₹ {formatCurrency(inv.amount_invested)}</strong>
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
