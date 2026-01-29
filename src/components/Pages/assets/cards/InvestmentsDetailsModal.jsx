import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInvestmentsDetails,
  updateInvestment,
  softDeleteInvestment,
} from "../../../../lib/api/assets.api";
import "./InvestmentsCard.css";
import { formatCurrency } from "../../../../lib/formatters";

const INVESTMENT_TYPES = [
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Stock", value: "stock" },
  { label: "Fixed Deposit (FD)", value: "fixed_deposit" },
  { label: "Recurring Deposit (RD)", value: "recurring_deposit" },
  { label: "Other", value: "other" },
];

const TYPE_LABELS = INVESTMENT_TYPES.reduce((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {});

export default function InvestmentsDetailsModal({ isOpen, onClose, currency }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", investment_type: "", amount_invested: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["investments-details"],
    queryFn: () => getInvestmentsDetails(),
    enabled: isOpen,
  });

  const investments = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", investment_type: "", amount_invested: "" });
    setFormError("");
  };

  const startEdit = (investment) => {
    setEditingId(investment.id);
    setForm({
      name: investment.name || "",
      investment_type: investment.investment_type || "",
      amount_invested: investment.amount_invested ?? "",
    });
    setFormError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    const name = form.name.trim();
    const investment_type = form.investment_type;
    const amountNum = parseFloat(form.amount_invested);

    if (!name || !investment_type) {
      setFormError("Name and type are required.");
      return;
    }
    if (Number.isNaN(amountNum) || amountNum < 0) {
      setFormError("Amount must be zero or more.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await updateInvestment(editingId, {
        name,
        investment_type,
        amount_invested: amountNum,
      });
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["investments-total"] });
      queryClient.invalidateQueries({ queryKey: ["investments-details"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to update investment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (investmentId) => {
    const ok = window.confirm("This will remove the investment from assets. It will remain archived.");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await softDeleteInvestment(investmentId);
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["investments-total"] });
      queryClient.invalidateQueries({ queryKey: ["investments-details"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to delete investment.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assets-page-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div>
            <p className="assets-page-modal-kicker">Investments</p>
            <h4>Know more</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close investments details"
          >
            ×
          </button>
        </div>

        {isLoading || isFetching ? <p>Loading investments…</p> : null}
        {isError ? <p>Unable to load investments right now.</p> : null}

        {investments.length === 0 && !isLoading ? (
          <p className="assets-page-muted">No investments found.</p>
        ) : (
          <div className="assets-page-list">
            {investments.map((inv) => (
              <div className="assets-page-row" key={inv.id}>
                <div>
                  <strong>{inv.name}</strong>
                  <div className="assets-page-muted">Type: {TYPE_LABELS[inv.investment_type] || "Other"}</div>
                  <div>Amount invested: ₹ {formatCurrency(inv.amount_invested)}</div>
                </div>
                <div className="assets-page-row-meta">
                  <button
                    type="button"
                    className="assets-page-btn ghost"
                    onClick={() => startEdit(inv)}
                    disabled={isSaving || isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="assets-page-btn"
                    onClick={() => handleDelete(inv.id)}
                    disabled={isSaving || isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingId ? (
          <form className="assets-page-form assets-page-form-section" onSubmit={handleUpdate}>
            <h4>Edit investment</h4>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid">
              <div className="assets-page-form-row">
                <label htmlFor="inv-name">Name *</label>
                <input
                  id="inv-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="inv-type">Investment type *</label>
                <select
                  id="inv-type"
                  value={form.investment_type}
                  onChange={(e) => setForm((f) => ({ ...f, investment_type: e.target.value }))}
                  required
                  disabled={isSaving}
                >
                  <option value="">Select type</option>
                  {INVESTMENT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="inv-amount">Amount invested *</label>
                <input
                  id="inv-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_invested}
                  onChange={(e) => setForm((f) => ({ ...f, amount_invested: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="assets-page-modal-actions">
              <button
                type="button"
                className="assets-page-btn ghost"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="assets-page-btn primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : null}

        {formError && !editingId ? <div className="assets-page-form-error">{formError}</div> : null}
      </div>
    </div>
  );
}
