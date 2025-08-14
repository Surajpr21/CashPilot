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
    iconSvg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#7c3aed"
        width="24px"
        height="24px"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
        />
      </svg>
    ),
  },
  {
    title: "Monthly Expense",
    value: "₹24,093",
    label: "Total Spent",
    change: "9.23%",
    positive: false,
    icon: "/icons/shipped.png",
    color: "#ef4444",
    iconSvg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#ef4444"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        />
      </svg>
    ),
  },
  {
    title: "Monthly Savings",
    value: "₹12,000",
    label: "Total Saved",
    change: "18.76%",
    positive: true,
    color: "#0ea5e9",
    iconSvg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#0ea5e9"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
        />
      </svg>
    ),
  },
  {
    title: "Investments",
    value: "₹1,50,000",
    label: "Total Invested",
    change: "15.00%",
    positive: true,
    color: "#10b981",
    iconSvg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#10b981"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
        />
      </svg>
    ),
  },
];

const StatsCards = () => {
  const renderCardContent = (item) => {
    // if (item.title === "Goal") {
    //   return (
    //     <>
    //       <div className="stats-card-dashboard-value">{item.value}</div>
    //       <div className="stats-card-dashboard-amounts">
    //         <span>Required: {item.required}</span>
    //         <span>Collected: {item.collected}</span>
    //       </div>
    //       <div className="stats-card-dashboard-progress">
    //         <div
    //           className="stats-card-dashboard-progress-bar"
    //           style={{
    //             width: `${item.progress}%`,
    //             backgroundColor: item.color,
    //           }}
    //         />
    //       </div>
    //     </>
    //   );
    // }

    return (
      <>
        <div className="stats-card-dashboard-value">{item.value}</div>
        <div
          className={`stats-card-dashboard-change ${
            item.positive ? "positive" : "negative"
          }`}
        >
          <span>
            {item.positive ? "▲" : "▼"} {item.change}
          </span>
        </div>
        {item.change} {item.positive ? "higher" : "lower"} than last 30 days.
      </>
    );
  };

  return (
    <div className="stats-card-dashboard-container">
      {statsData.map((item, index) => (
        <div key={index} className="stats-card-dashboard-card">
          <div
            className="stats-card-dashboard-strip"
            style={{ backgroundColor: item.color }}
          />
          <div className="stats-card-dashboard-content" style={{ gap: "20px" }}>
            <div className="stats-card-dashboard-header">
              <div
                className="stats-card-dashboard-title-wrapper"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {React.cloneElement(
                  item.iconSvg,
                  { width: "28px", height: "28px" }
                )}
                <span className="stats-card-dashboard-title">{item.title}</span>
              </div>
              <button className="stats-card-dashboard-menu">⋮</button>
            </div>
            {renderCardContent(item)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
