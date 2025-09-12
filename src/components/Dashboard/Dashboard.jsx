import React, { useState } from "react";
import "./Dashboard.css";
import Sidebar from "../Dashboard/Sidebar/Sidebar";
import DashboardHeader from "../Dashboard/DashboardHeader/DashboardHeader";
import StatsCards from "../Dashboard/StatsCard/StatsCards";
import MonthlyExpensesChart from "../Dashboard/MonthlyExpense/MonthlyExpensesChart";
import TopCategoryDonut from "../Dashboard/TopCategoryDonut/TopCategoryDonut";

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
        <div className="dashboard-stats">
          <StatsCards />
          </div>
      
      <div className="dashboard-charts-row">
        <MonthlyExpensesChart />
        <TopCategoryDonut />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
