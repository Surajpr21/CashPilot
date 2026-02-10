import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Snowfall from "react-snowfall";
import { Outlet, useLocation } from "react-router-dom";
import "./Dashboard.css";
import { DashboardDataProvider } from "../../contexts/DashboardDataContext";

export default function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [snowKey, setSnowKey] = useState(Date.now());
  const { pathname } = useLocation();
  const isProfileRoute = pathname.startsWith("/profile");

  useEffect(() => {
    // remount Snowfall briefly after route changes so the canvas sizes correctly
    const t = setTimeout(() => setSnowKey(Date.now()), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  const layoutContent = (
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
          zIndex: 1, // render snow above the sidebar (sidebar z-index is 10)
          width: "100vw",
          height: "100vh",
        }}
      />

      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <div
        className={`dashboard-content ${
          isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );

  if (isProfileRoute) return layoutContent;

  return <DashboardDataProvider>{layoutContent}</DashboardDataProvider>;
}
