import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import {
  getMetalHoldingsDetails,
  updateMetalHolding,
  softDeleteMetalHolding,
} from "../../../../lib/api/assets.api";
import "./InvestmentsCard.css";
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

export default function MetalsDetailsModal({ isOpen, onClose, metalHoldings = [] }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ metal_type: "", grams: "", buy_price_per_gram: "", purchased_at: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["metal-holdings-details"],
    queryFn: () => getMetalHoldingsDetails(),
    enabled: isOpen,
  });

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ metal_type: "", grams: "", buy_price_per_gram: "", purchased_at: "" });
    setFormError("");
  };

  const startEdit = (holding) => {
    setEditingId(holding.id);
    setForm({
      metal_type: holding.metal_type || "",
      grams: holding.grams ?? "",
      buy_price_per_gram: holding.buy_price_per_gram ?? "",
      purchased_at: holding.purchased_at || "",
    });
    setFormError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    const gramsNum = parseFloat(form.grams);
    const buyPriceNum = form.buy_price_per_gram === "" ? null : parseFloat(form.buy_price_per_gram);

    if (!form.metal_type) {
      setFormError("Metal type is required.");
      return;
    }
    if (Number.isNaN(gramsNum) || gramsNum <= 0) {
      setFormError("Quantity must be greater than 0 grams.");
      return;
    }
    if (form.buy_price_per_gram !== "" && (Number.isNaN(buyPriceNum) || buyPriceNum < 0)) {
      setFormError("Buy price per gram must be zero or more.");
      return;
    }
    if (!form.purchased_at) {
      setFormError("Purchase date is required.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await updateMetalHolding(editingId, {
        metal_type: form.metal_type,
        grams: gramsNum,
        buy_price_per_gram: buyPriceNum,
        purchased_at: form.purchased_at,
      });
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to update metal holding.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (holdingId) => {
    const ok = window.confirm("This will remove the metal holding from assets. It will remain archived.");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await softDeleteMetalHolding(holdingId);
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to delete metal holding.");
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
            <p className="assets-page-modal-kicker">Precious Metals</p>
            <h4>Know more</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close metals details"
          >
            ×
          </button>
        </div>

        <div className="assets-page-card-heading" style={{ marginBottom: "12px" }}>
          <span className="assets-page-card-icon assets-page-card-icon-metals" aria-hidden="true">
            <HugeiconsIcon icon={SparklesIcon} size={20} strokeWidth={1.9} color="#f59e0b" />
          </span>
          <h3>Precious Metals Holdings</h3>
        </div>

        {isLoading || isFetching ? <p>Loading metal holdings…</p> : null}
        {isError ? <p>Unable to load metal holdings right now.</p> : null}

        {rows.length === 0 && !isLoading ? (
          <p className="assets-page-muted">No metal holdings found.</p>
        ) : (
          <div className="assets-page-list">
            {rows.map((metal) => {
              const label = METAL_LABELS[metal?.metal_type] || "Other";
              const grams = formatNumber(metal?.grams ?? 0);
              const avgPrice = metal?.buy_price_per_gram;
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
                <div className="assets-page-row" key={metal?.id || `${metal?.metal_type}-${grams}-${purchasedAt || "na"}`}>
                  <div>
                    <span>{label}</span>
                    {purchasedAtText ? <div className="assets-page-muted">Purchased {purchasedAtText}</div> : null}
                  </div>
                  <div className="assets-page-row-meta">
                    <span>{grams} g</span>
                    <span className="assets-page-muted">avg {avgPriceText}</span>
                    <button
                      type="button"
                      className="assets-page-btn ghost"
                      onClick={() => startEdit(metal)}
                      disabled={isSaving || isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="assets-page-btn"
                      onClick={() => handleDelete(metal.id)}
                      disabled={isSaving || isDeleting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {editingId ? (
          <form className="assets-page-form assets-page-form-section" onSubmit={handleUpdate}>
            <h4>Edit metal holding</h4>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid">
              <div className="assets-page-form-row">
                <label htmlFor="metal-type-edit">Metal type *</label>
                <select
                  id="metal-type-edit"
                  value={form.metal_type}
                  onChange={(e) => setForm((f) => ({ ...f, metal_type: e.target.value }))}
                  required
                  disabled={isSaving}
                >
                  <option value="">Select metal</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="platinum">Platinum</option>
                  <option value="palladium">Palladium</option>
                  <option value="diamond">Diamond</option>
                  <option value="jewelry">Other jewellery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="metal-grams-edit">Quantity (g) *</label>
                <input
                  id="metal-grams-edit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.grams}
                  onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="metal-buy-price-edit">Buy price per gram</label>
                <input
                  id="metal-buy-price-edit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buy_price_per_gram}
                  onChange={(e) => setForm((f) => ({ ...f, buy_price_per_gram: e.target.value }))}
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="metal-purchased-date-edit">Purchase date *</label>
                <input
                  id="metal-purchased-date-edit"
                  type="date"
                  value={form.purchased_at}
                  onChange={(e) => setForm((f) => ({ ...f, purchased_at: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="assets-page-modal-actions">
              <button type="button" className="assets-page-btn ghost" onClick={resetForm} disabled={isSaving}>
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
