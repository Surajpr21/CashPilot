import React from "react";
import "./notification-panel.css";

const NotificationPanel = ({
  notifications,
  loading,
  onMarkRead,
  onOpenIncome,
}) => {
  if (loading) return <div className="cp-notif-loading">Loading...</div>;

  if (!notifications.length)
    return <div className="cp-notif-empty">No notifications</div>;

  return (
    <div className="cp-notif-wrapper">
      {notifications.map((notif) => (
        <div key={notif.id} className="cp-notif-card">
          <div className="cp-notif-content">
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
          </div>

          <div className="cp-notif-actions">
            {notif.type === "income_reminder" && (
              <button
                className="cp-notif-action"
                onClick={() => {
                  if (onOpenIncome) onOpenIncome();
                  if (onMarkRead) onMarkRead(notif.id);
                }}
              >
                Add Income
              </button>
            )}
            <button
              className="cp-notif-dismiss"
              onClick={() => onMarkRead?.(notif.id)}
              aria-label="Mark notification as read"
            >
              Mark read
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
