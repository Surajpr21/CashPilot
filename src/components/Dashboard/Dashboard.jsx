// src/pages/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import './Dashboard.css';
import Sidebar from '../Dashboard/Sidebar/Sidebar';

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
        className={`dashboard-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
      >
        {/* Future content like Graph, Donut, Table will go here */}
        <h1>Hi Suraj</h1>
        <h4>Track All Your Expense & Transactions</h4>
      </div>
    </div>
  );
};

export default Dashboard;
