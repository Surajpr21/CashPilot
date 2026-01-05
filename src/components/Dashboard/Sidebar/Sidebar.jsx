import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  List,
  CreditCard,
  Wallet,
  BarChart2,
  Settings,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

const NAV_TABS = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "expenses", label: "Expenses", path: "/expenses", icon: <List size={18} /> },
  { key: "subscriptions", label: "Subscriptions", path: "/subscriptions", icon: <CreditCard size={18} /> },
  { key: "budgets", label: "Budgets", path: "/budgets", icon: <Wallet size={18} /> },
  // { key: "insights", label: "Insights", path: "/insights", icon: <PieChart size={18} /> },
  // { key: "reports", label: "Reports", path: "/reports", icon: <BarChart2 size={18} /> },
  { key: "goals", label: "Goals", path: "/goals", icon: <BarChart2 size={18} /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // derive active tab from URL (works for nested routes too)
  const activeKey =
    NAV_TABS.find(tab => pathname.startsWith(tab.path))?.key ?? "";

  return (
    <div className="topbar">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        CashPilot
      </div>

      <div className="controls">
        <nav className="nav">
          {NAV_TABS.map(tab => (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={`nav-item ${activeKey === tab.key ? "active" : ""}`}
            >
              {/* {tab.icon}  — enable icons later if needed */}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="right-actions">
          <div className="icons">
            <button className="icon-btn">
              <Bell size={18} />
            </button>
            <button className="icon-btn">
              <User size={18} />
            </button>
          </div>

          <div className="settings-group">
            <div className="divider-left" />

            <button className="nav-item">
              <Settings size={18} />
            </button>

            <button className="nav-item">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
