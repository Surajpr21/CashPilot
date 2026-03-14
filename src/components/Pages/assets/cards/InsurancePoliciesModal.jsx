import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { RupeeShieldIcon } from "@hugeicons/core-free-icons";
import {
  getInsurancePoliciesSummary,
  updateInsurancePolicy,
  softDeleteInsurancePolicy,
} from "../../../../lib/api/assets.api";
import { INSURANCE_TYPES } from "../../../../constants/insuranceTypes";
import { formatCurrency } from "../../../../lib/formatters";
import "./InvestmentsCard.css";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

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

  const isEditPopupOpen = Boolean(editingId);

  const renderEditPopup = () => {
    if (!isEditPopupOpen) return null;

    return (
      <div
        className="assets-page-modal-backdrop assets-page-modal-edit-backdrop"
        onClick={(e) => {
          e.stopPropagation();
          resetForm();
        }}
      >
        <div
          className="assets-page-modal assets-page-modal-investment assets-page-modal-edit-popup"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="assets-page-modal-header">
            <div>
              <p className="assets-page-modal-kicker">Insurance</p>
              <h4>Edit policy</h4>
            </div>
            <button type="button" className="assets-page-modal-close" onClick={resetForm} aria-label="Close edit policy">
              ×
            </button>
          </div>

          <form className="assets-page-form assets-page-form-investment" onSubmit={handleUpdate}>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid assets-page-form-grid-investment">
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
                <CustomDropdown
                  id="policy-type"
                  label="Insurance type"
                  options={INSURANCE_TYPES}
                  value={form.insurance_type}
                  onChange={(val) => setForm((f) => ({ ...f, insurance_type: val }))}
                  placeholder="Select type"
                  width="100%"
                  menuMaxHeight="220px"
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="policy-active">Status</label>
                <button
                  id="policy-active"
                  type="button"
                  className={`date-picker-trigger ${form.is_active ? "open" : "placeholder"}`}
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  disabled={isSaving}
                  aria-pressed={form.is_active}
                >
                  <span>{form.is_active ? "Active" : "Inactive"}</span>
                </button>
                <span className="assets-page-hint">Use inactive when the policy is no longer active.</span>
              </div>
            </div>

            <div className="assets-page-form-note">
              <p>Policy details update the insurance view only. Premium history remains unchanged.</p>
            </div>

            <div className="assets-page-modal-actions assets-page-modal-actions-investment">
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
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="assets-page-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal assets-page-modal-investment assets-page-modal-details" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div style={{zIndex:"99"}} className="assets-page-card-heading">
            <span className="assets-page-card-icon assets-page-card-icon-insurance" aria-hidden="true">
              <HugeiconsIcon icon={RupeeShieldIcon} size={25} strokeWidth={1.9} color="#ef4444" />
            </span>
            <h3>Insurance</h3>
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
          <div className="assets-page-list assets-page-list-scrollable">
            {policies.map((policy) => (
              <div className="assets-page-row" key={policy.policy_id}>
                <div className="assets-page-row-main">
                  <div className="assets-item-title">{policy.provider} – {policy.policy_name}</div>
                  <div className="assets-meta-list">
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Type</span>
                      <span className="assets-meta-value">{TYPE_LABELS[policy.insurance_type] || "Other"}</span>
                    </div>
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Premiums paid</span>
                      <span className="assets-meta-value">{policy.premiums_paid_count ?? 0}</span>
                    </div>
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Total paid</span>
                      <span className="assets-meta-value">₹ {formatCurrency(policy.total_premiums_paid)}</span>
                    </div>
                  </div>
                </div>
                <div className="assets-page-row-meta">
                  <button
                    type="button"
                    className="assets-page-btn assets-action-btn-edit"
                    onClick={() => startEdit(policy)}
                    disabled={isSaving || isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="assets-page-btn assets-action-btn-delete"
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

        {formError && !editingId ? <div className="assets-page-form-error">{formError}</div> : null}
      </div>

      {renderEditPopup()}
    </div>
  );
}
