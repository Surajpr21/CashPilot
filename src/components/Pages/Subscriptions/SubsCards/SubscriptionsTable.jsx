import React, { useState } from "react";
import { formatAmount, daysLeft, getStatus, cycleLabel, dateLabel } from "../utils/subscriptions.utils";
import SubscriptionForm from "./SubscriptionForm/SubscriptionForm";
import ConfirmDialog from "./ConfirmDialog/ConfirmDialog";
import ReactivateDialog from "./ReactivateDialog/ReactivateDialog";

export default function SubscriptionsTable({ subs = [], onPause, onResume, onCancel, onEdit, onReactivate }) {
  const [editingSub, setEditingSub] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reactivatingId, setReactivatingId] = useState(null);

  const handleEditClick = (sub) => {
    setEditingSub(sub);
  };

  const handleCloseEdit = () => {
    setEditingSub(null);
  };

  const handleEditComplete = () => {
    setEditingSub(null);
    if (onEdit) onEdit();
  };

  const handleCancelClick = (id) => {
    setCancellingId(id);
  };

  const handleConfirmCancel = () => {
    if (cancellingId && onCancel) {
      onCancel(cancellingId);
    }
    setCancellingId(null);
  };

  const handleCancelDialog = () => {
    setCancellingId(null);
  };

  const handleReactivateClick = (id) => {
    setReactivatingId(id);
  };

  const handleConfirmReactivate = (nextDue) => {
    if (reactivatingId && onReactivate) {
      onReactivate(reactivatingId, nextDue);
    }
    setReactivatingId(null);
  };

  const handleCancelReactivate = () => {
    setReactivatingId(null);
  };

  return (
    <div className="subscriptions-page-table">
      {subs.map((sub) => {
        const dLeft = daysLeft(sub.next_due);
        const dueText = `in ${dLeft} days on ${dateLabel(sub.next_due)}`;
        const status = getStatus(sub);
        const canPause = status === "active";
        const canResume = status === "paused";
        const isCancelled = status === "inactive";

        return (
          <div key={sub.id} className="subscriptions-page-card">
            <div className="subscriptions-page-card-left">
              <div className="subscriptions-page-card-title">{sub.name}</div>

              <div className="subscriptions-page-card-meta">
                {formatAmount(sub.amount)} · {dueText}
              </div>

              <div className="subscriptions-page-card-category">
                {(sub.category || "").toString().replace(/^./, (c) => c.toUpperCase())} · {cycleLabel(sub.billing_cycle)}
              </div>
            </div>

            <div className="subscriptions-page-card-right">
              <span className={`subscriptions-page-status subscriptions-page-status-${status}`}>
                {status}
              </span>

              <div className="subscriptions-page-actions">
                {!isCancelled && canPause && (
                  <button onClick={() => onPause && onPause(sub.id)}>
                    Pause
                  </button>
                )}
                {!isCancelled && canResume && (
                  <button onClick={() => onResume && onResume(sub.id)}>
                    Resume
                  </button>
                )}
                {!isCancelled && (
                  <button onClick={() => handleEditClick(sub)}>
                    Edit
                  </button>
                )}
                {!isCancelled ? (
                  <button className="danger" onClick={() => handleCancelClick(sub.id)}>
                    Cancel
                  </button>
                ) : (
                  <>
                    <button className="reactivate-btn" onClick={() => handleReactivateClick(sub.id)}>
                      Re-activate
                    </button>
                    <button className="cancelled" disabled>
                      Cancelled
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {editingSub && (
        <div
          className="subs-modal-overlay"
          onClick={handleCloseEdit}
        >
          <div
            className="subs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="subs-modal-close"
              aria-label="Close"
              onClick={handleCloseEdit}
            >
              ×
            </button>
            <SubscriptionForm
              editMode={true}
              subscription={editingSub}
              onClose={handleCloseEdit}
              onSubscriptionAdded={handleEditComplete}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={cancellingId !== null}
        title="Cancel Subscription?"
        message="Are you sure you want to cancel this subscription? This action cannot be undone."
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelDialog}
      />

      <ReactivateDialog
        isOpen={reactivatingId !== null}
        onReactivate={handleConfirmReactivate}
        onCancel={handleCancelReactivate}
      />
    </div>
  );
}
