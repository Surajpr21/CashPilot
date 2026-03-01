import React, { useState } from "react";
import ReactDOM from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatAmount, daysLeft, getStatus, cycleLabel, dateLabel } from "../utils/subscriptions.utils";
import SubscriptionForm from "./SubscriptionForm/SubscriptionForm";
import SmartAvatar from "./SubscriptionForm/SmartAvatar";
import ConfirmDialog from "./ConfirmDialog/ConfirmDialog";
import ReactivateDialog from "./ReactivateDialog/ReactivateDialog";

export default function SubscriptionsTable({ subs = [], onPause, onResume, onCancel, onEdit, onReactivate, onMarkAsPaid }) {
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
        const displayName = (sub?.name || "").toString().trim() || "Subscription";
        const dLeft = daysLeft(sub.next_due);
        const dueText = `in ${dLeft} days on ${dateLabel(sub.next_due)}`;
        const uiStatus = getStatus(sub);
        const statusLabel = uiStatus === "due-soon"
          ? "Due soon"
          : uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1);
        const canPause = sub.status === "active";
        const canResume = sub.status === "paused";
        const isCancelled = sub.status === "inactive";
        const showMarkAsPaid = sub.status === "active";
        const amountText = formatAmount(sub.amount);
        const metaText = isCancelled ? amountText : `${amountText} · ${dueText}`;

        return (
          <div key={sub.id} className="subscriptions-page-card">
            <div className="subscriptions-page-card-left">
              <div className="subscriptions-page-card-header">
                <SmartAvatar name={sub?.name} domain={sub?.website} size={48} />
                <div className="subscriptions-page-card-title">{displayName}</div>
              </div>

              <div className="subscriptions-page-card-meta">
                {metaText}
              </div>

              <div className="subscriptions-page-card-category">
                {(sub.category || "").toString().replace(/^./, (c) => c.toUpperCase())} · {cycleLabel(sub.billing_cycle)}
              </div>
            </div>

            <div className="subscriptions-page-card-right">
              <span className={`subscriptions-page-status subscriptions-page-status-${uiStatus}`}>
                {statusLabel}
              </span>

              <div className="subscriptions-page-actions">
                {showMarkAsPaid && (
                  <button className="mark-paid-btn" onClick={() => onMarkAsPaid && onMarkAsPaid(sub)}>
                    Mark as Paid
                  </button>
                )}
                {!isCancelled && canPause && (
                  <button className="pause-btn" onClick={() => onPause && onPause(sub.id)}>
                    Pause
                  </button>
                )}
                {!isCancelled && canResume && (
                  <button className="resume-btn" onClick={() => onResume && onResume(sub.id)}>
                    Resume
                  </button>
                )}
                {!isCancelled && (
                  <button className="edit-btn" onClick={() => handleEditClick(sub)}>
                    Edit
                  </button>
                )}
                {!isCancelled ? (
                  <button className="cancel-btn" onClick={() => handleCancelClick(sub.id)}>
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

      {editingSub && ReactDOM.createPortal(
        (
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
                <XMarkIcon width={18} height={18} aria-hidden="true" />
              </button>
              <SubscriptionForm
                editMode={true}
                subscription={editingSub}
                onClose={handleCloseEdit}
                onSubscriptionAdded={handleEditComplete}
              />
            </div>
          </div>
        ),
        document.body
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
