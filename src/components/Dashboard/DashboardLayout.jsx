import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Snowfall from "react-snowfall";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { DashboardDataProvider } from "../../contexts/DashboardDataContext";
import NotificationPanel from "../NotificationPanel/NotificationPanel";
import { useNotifications } from "../../hooks/useNotifications";

export default function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [snowKey, setSnowKey] = useState(Date.now());
  const [showNotifications, setShowNotifications] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    // remount Snowfall briefly after route changes so the canvas sizes correctly
    const t = setTimeout(() => setSnowKey(Date.now()), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    // remount Snowfall on resize so the canvas matches the viewport
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setSnowKey(Date.now()), 80);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DashboardDataProvider>
      <div className="dashboard-container">
        <Snowfall
          key={snowKey}
          snowflakeCount={200}
          color="rgba(150,150,150,0.45)"
          radius={[0.8, 1.6]}
          speed={[0.3, 0.7]}
          wind={[-0.1, 0.2]}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0, // keep snow behind all dashboard UI
            width: "100vw",
            height: "100vh",
          }}
        />

        <Sidebar
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          onToggleNotifications={() => setShowNotifications((prev) => !prev)}
        />

        {showNotifications && (
          <div className="notification-popover">
            <NotificationPanel
              notifications={notifications}
              loading={notificationsLoading}
              onMarkRead={(id) => {
                markAsRead(id);
                // close popover if all are read
                if (notifications.length <= 1) {
                  setShowNotifications(false);
                }
              }}
              onOpenIncome={() => {
                setShowNotifications(false);
                navigate("/expenses", { state: { openIncome: true } });
              }}
            />
          </div>
        )}

        <div
          className={`dashboard-content ${
            isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </DashboardDataProvider>
  );
}
