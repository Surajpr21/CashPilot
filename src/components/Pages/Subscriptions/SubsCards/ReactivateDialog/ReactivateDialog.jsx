import React, { useState } from "react";
import "./ReactivateDialog.css";

export default function ReactivateDialog({ isOpen, onReactivate, onCancel }) {
  const [nextDue, setNextDue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nextDue) {
      onReactivate(nextDue);
      setNextDue("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reactivate-dialog-overlay" onClick={onCancel}>
      <div className="reactivate-dialog" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="reactivate-dialog-header">
            <h3>Re-activate Subscription</h3>
          </div>
          
          <div className="reactivate-dialog-body">
            <label className="reactivate-field">
              <span>Next billing date</span>
              <input
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                required
                autoFocus
              />
            </label>
          </div>
          
          <div className="reactivate-dialog-actions">
            <button type="button" className="reactivate-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="reactivate-confirm">
              Re-activate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
