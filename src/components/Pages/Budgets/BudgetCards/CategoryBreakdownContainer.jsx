import React from "react";

const categories = [
  {
    name: "Food",
    budget: 8000,
    actual: 9200,
    diff: "+₹1,200",
    status: "over",
    progress: 100
  },
  {
    name: "Entertainment",
    budget: 6000,
    actual: 6500,
    diff: "+₹500",
    status: "over",
    progress: 100
  },
  {
    name: "Shopping",
    budget: 5000,
    actual: 4100,
    diff: "-₹900",
    status: "under",
    progress: 82
  },
  {
    name: "Transport",
    budget: 4000,
    actual: 3200,
    diff: "-₹800",
    status: "under",
    progress: 80
  },
  {
    name: "Subscriptions",
    budget: 3500,
    actual: 3400,
    diff: "On track",
    status: "track",
    progress: 95
  },
  {
    name: "Utilities",
    budget: 5500,
    actual: 5500,
    diff: "On track",
    status: "track",
    progress: 100
  }
];

export default function CategoryBreakdownContainer() {
  return (
    <div className="bVa-page-category-container">
      <h2 className="bVa-page-section-title">Category-wise Breakdown</h2>

      {categories.map((cat) => (
        <div key={cat.name} className="bVa-page-category-row">
          {/* LEFT CONTENT */}
          <div className="bVa-page-category-main">
            <div className="bVa-page-category-title">{cat.name}</div>
            <div className="bVa-page-category-sub">
              ₹{cat.budget} budget • ₹{cat.actual}
            </div>

            <div className="bVa-page-budget-label">
              budget ₹{cat.budget}
            </div>

            <div className="bVa-page-progress-track">
              <div
                className={`bVa-page-progress-fill bVa-${cat.status}`}
                style={{ width: `${cat.progress}%` }}
              />
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="bVa-page-category-actions">
            <span className={`bVa-page-diff bVa-${cat.status}`}>
              {cat.diff}
            </span>

            <button className="bVa-page-edit-btn">
              {cat.status === "track" ? "On track" : "Edit"}
            </button>
          </div>
        </div>
      ))}

      {/* SMART INSIGHTS */}
      <div className="bVa-page-insights">
        <h4>Smart Insights</h4>
        <ul>
          <li>⚠️ Food exceeded budget by ₹1,200</li>
          <li>🎉 Transport saved ₹800 this month</li>
        </ul>
      </div>
    </div>
  );
}
