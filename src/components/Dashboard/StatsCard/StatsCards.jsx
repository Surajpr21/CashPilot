// src/components/StatsCards/StatsCards.jsx
import React from "react";
import "./StatsCards.css";

const statsData = [
  {
    title: "Total Balance",
    value: "₹8,98,450",
    label: "Total Balance",
    change: "20.76%",
    positive: true,
    icon: "/icons/in-transit.png",
    color: "#7c3aed",
  },
  {
    title: "Monthly Expense",
    value: "₹24,093",
    label: "Total Spent",
    change: "9.23%",
    positive: false,
    icon: "/icons/shipped.png",
    color: "#ef4444",
  },
  {
    title: "Monthly Savings",
    value: "₹12,000",
    label: "Total Saved",
    change: "18.76%",
    positive: true,
    color: "#0ea5e9",
  },
  {
    title: "Investments",
    value: "₹1,50,000",
    label: "Total Invested",
    change: "15.00%",
    positive: true,
    color: "#10b981",
  },
  {
    title: "Goal",
    value: "iPhone 17 Pro",
    label: "₹75,000 of ₹1,45,000",
    change: "51.70%",
    positive: true,
    color: "#14b8a6",
  },
];

const StatsCards = () => {
  return (
    <div className="stats-card-dashboard-container">
      {statsData.map((item, index) => (
        <div key={index} className="stats-card-dashboard-card">
          {/* Left strip */}
          <div
            className="stats-card-dashboard-strip"
            style={{ backgroundColor: item.color }}
          ></div>

          <div className="stats-card-dashboard-header">
            <span className="stats-card-dashboard-title">{item.title}</span>
            <button className="stats-card-dashboard-menu">⋮</button>
          </div>

          <div className="stats-card-dashboard-value">{item.value}</div>

          <div
            className={`stats-card-dashboard-change ${
              item.positive ? "positive" : "negative"
            }`}
          >
            <span>{item.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
