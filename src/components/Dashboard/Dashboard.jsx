// src/pages/Dashboard/Dashboard.jsx
import React, { useState } from "react";
import "./Dashboard.css";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import DashboardHeader from "../Dashboard/DashboardHeader/DashboardHeader";

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab="dashboard"
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <div
        className={`dashboard-content ${
          isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        }`}
      >
         <DashboardHeader />
      </div>
    </div>
  );
};

export default Dashboard;
