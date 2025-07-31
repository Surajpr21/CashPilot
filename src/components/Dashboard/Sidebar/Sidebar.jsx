// src/components/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import "./Sidebar.css";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";


const menuItems = [
  { label: "Dashboard", icon: "📊", key: "dashboard" },
  { label: "Add Expense", icon: "➕", key: "add-expense" },
  { label: "All Expenses", icon: "📋", key: "all-expenses" },
  { label: "Subscriptions", icon: "🔁", key: "subscriptions" },
  { label: "Categories", icon: "🏷️", key: "categories" },
  { label: "Budgets", icon: "💰", key: "budgets" },
  { label: "Reports", icon: "📈", key: "reports" },
  { label: "Settings", icon: "⚙️", key: "settings" },
  { label: "Profile", icon: "👤", key: "profile" },
  { label: "Logout", icon: "🚪", key: "logout" },
];

const Sidebar = ({ activeTab, isExpanded, setIsExpanded }) => {
  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">{isExpanded ? "CashPilot" : ""}</div>

        <button
          className="sidebar-toggle"
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ArrowLeftStartOnRectangleIcon className="h-6 w-6 text-white" />
          ) : (
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`sidebar-item ${activeTab === item.key ? "active" : ""}`}
            title={!isExpanded ? item.label : ""}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {isExpanded && <span className="sidebar-label">{item.label}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <img
            src="https://i.pravatar.cc/36?img=3"
            alt="avatar"
            className="avatar"
          />
          {isExpanded && (
            <>
              <div className="profile-info">
                <div className="profile-name">Tran Mau Tri Tam</div>
                <div className="profile-email">tam@ui8.net</div>
              </div>
              <div className="badge">Free</div>
            </>
          )}
        </div>
        {isExpanded && (
          <>
            <button className="upgrade-btn">Upgrade to Pro</button>
            <div className="theme-toggle">
              <span>🌙</span>
              <span>Light</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
