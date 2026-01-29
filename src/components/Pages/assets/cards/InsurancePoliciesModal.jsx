import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInsurancePoliciesSummary,
  updateInsurancePolicy,
  softDeleteInsurancePolicy,
} from "../../../../lib/api/assets.api";
import { INSURANCE_TYPES } from "../../../../constants/insuranceTypes";
import { formatCurrency } from "../../../../lib/formatters";
import "./InvestmentsCard.css";

const TYPE_LABELS = INSURANCE_TYPES.reduce((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {});

export default function InsurancePoliciesModal({ isOpen, onClose, currency }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ provider: "", policy_name: "", insurance_type: "", is_active: true });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["insurance-policies-summary"],
    queryFn: () => getInsurancePoliciesSummary(),
    enabled: isOpen,
  });

  const policies = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ provider: "", policy_name: "", insurance_type: "", is_active: true });
    setFormError("");
  };

  const startEdit = (policy) => {
    setEditingId(policy.policy_id);
    setForm({
      provider: policy.provider || "",
      policy_name: policy.policy_name || "",
      insurance_type: policy.insurance_type || "",
      is_active: Boolean(policy.is_active),
    });
    setFormError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!form.provider.trim() || !form.policy_name.trim() || !form.insurance_type) {
      setFormError("Provider, name, and type are required.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await updateInsurancePolicy(editingId, {
        provider: form.provider.trim(),
        policy_name: form.policy_name.trim(),
        insurance_type: form.insurance_type,
        is_active: Boolean(form.is_active),
      });
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["insurance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-policies-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to update policy.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (policyId) => {
    const ok = window.confirm(
      "This will remove the policy from assets.\nPremium history will remain."
    );
    if (!ok) return;

    try {
      setIsDeleting(true);
      await softDeleteInsurancePolicy(policyId);
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["insurance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-policies-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to delete policy.");
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
            <p className="assets-page-modal-kicker">Insurance</p>
            <h4>Know more</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close insurance details"
          >
            ×
          </button>
        </div>

        {isLoading || isFetching ? <p>Loading policies…</p> : null}
        {isError ? <p>Unable to load policies right now.</p> : null}

        {policies.length === 0 && !isLoading ? (
          <p className="assets-page-muted">No policies found.</p>
        ) : (
          <div className="assets-page-list">
            {policies.map((policy) => (
              <div className="assets-page-row" key={policy.policy_id}>
                <div>
                  <strong>{policy.provider} – {policy.policy_name}</strong>
                  <div className="assets-page-muted">Type: {TYPE_LABELS[policy.insurance_type] || "Other"}</div>
                  <div>Premiums paid: {policy.premiums_paid_count ?? 0}</div>
                  <div>
                    Total paid: ₹ {formatCurrency(policy.total_premiums_paid)}
                  </div>
                </div>
                <div className="assets-page-row-meta">
                  <button
                    type="button"
                    className="assets-page-btn ghost"
                    onClick={() => startEdit(policy)}
                    disabled={isSaving || isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="assets-page-btn"
                    onClick={() => handleDelete(policy.policy_id)}
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
            <h4>Edit policy</h4>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid">
              <div className="assets-page-form-row">
                <label htmlFor="policy-provider">Provider *</label>
                <input
                  id="policy-provider"
                  type="text"
                  value={form.provider}
                  onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="policy-name">Policy name *</label>
                <input
                  id="policy-name"
                  type="text"
                  value={form.policy_name}
                  onChange={(e) => setForm((f) => ({ ...f, policy_name: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="policy-type">Insurance type *</label>
                <select
                  id="policy-type"
                  value={form.insurance_type}
                  onChange={(e) => setForm((f) => ({ ...f, insurance_type: e.target.value }))}
                  required
                  disabled={isSaving}
                >
                  <option value="">Select type</option>
                  {INSURANCE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="assets-page-form-row">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    disabled={isSaving}
                  />
                  Active
                </label>
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
