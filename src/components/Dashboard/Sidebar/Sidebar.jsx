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
  LogOut,
  PiggyBank,
} from "lucide-react";
import "./Sidebar.css";
import { useAuth } from "../../../contexts/AuthContext";

const NAV_TABS = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "expenses", label: "Trasactions", path: "/expenses", icon: <List size={18} /> },
  { key: "subscriptions", label: "Subscriptions", path: "/subscriptions", icon: <CreditCard size={18} /> },
  { key: "budgets", label: "Budgets", path: "/budgets", icon: <Wallet size={18} /> },
  { key: "assets", label: "Assets", path: "/assets", icon: <PieChart size={18} /> },
  { key: "savings", label: "Savings", path: "/savings", icon: <PiggyBank size={18} /> },
  // { key: "insights", label: "Insights", path: "/insights", icon: <PieChart size={18} /> },
  // { key: "reports", label: "Reports", path: "/reports", icon: <BarChart2 size={18} /> },
  { key: "goals", label: "Goals", path: "/goals", icon: <BarChart2 size={18} /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, profile } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // derive active tab from URL (works for nested routes too)
  const activeKey =
    NAV_TABS.find(tab => pathname.startsWith(tab.path))?.key ?? "";

  const avatarUrl = profile?.avatar_url ?? null;
  const avatarInitials = (profile?.full_name || profile?.email || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "?";

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
            {/* <button className="icon-btn">
              <Bell size={22} />
            </button> */}
            <button className="icon-btn avatar-btn" onClick={() => navigate("/profile")} title="Profile & Settings">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile avatar" className="avatar-thumb" />
              ) : (
                <span className="avatar-thumb avatar-fallback" aria-label="Profile">
                  {avatarInitials}
                </span>
              )}
            </button>
          </div>

          <div className="settings-group">
            <div className="divider-left" />

            {/* <button className="nav-item">
              <Settings size={22} />
            </button> */}

            <button className="nav-item" onClick={handleLogout} title="Logout">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
