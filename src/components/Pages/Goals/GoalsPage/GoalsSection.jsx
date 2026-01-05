import React from "react";

const goals = [
  {
    name: "Vacation",
    target: 150000,
    saved: 65000,
    left: 85000,
    deadline: "Dec 2024",
    status: "behind",
    progress: 45
  },
  {
    name: "Emergency Fund",
    target: 200000,
    saved: 120000,
    left: 80000,
    deadline: "Jun 2026",
    status: "ontrack",
    progress: 60
  },
  {
    name: "Laptop",
    target: 150000,
    saved: 150000,
    left: 0,
    deadline: "May 2025",
    status: "completed",
    progress: 100
  }
];

export default function GoalsSection() {
  return (
    <div className="goals-page-section">
      {goals.map((goal) => (
        <div key={goal.name} className="goals-page-goal-card">
          {/* TOP */}
          <div className="goals-page-goal-top">
            <div>
              <h3 className="goals-page-goal-title">{goal.name}</h3>
              <p className="goals-page-goal-sub">
                ₹{goal.target.toLocaleString()} target • ₹{goal.saved.toLocaleString()} saved
              </p>
            </div>

            <span className={`goals-page-status goals-${goal.status}`}>
              {goal.status === "ontrack"
                ? "On track"
                : goal.status === "behind"
                ? "Behind"
                : "Completed"}
            </span>
          </div>

          {/* PROGRESS */}
          <div className="goals-page-progress-block">
            <div className="goals-page-progress-track">
              <div
                className={`goals-page-progress-fill goals-${goal.status}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <div className="goals-page-progress-meta">
              {goal.left > 0 ? (
                <>
                  ₹{goal.left.toLocaleString()} left · Target: {goal.deadline}
                </>
              ) : (
                <>Target: {goal.deadline} · Completed</>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="goals-page-actions">
            <button>Add Money</button>
            <button>Edit</button>
            <button className="danger">Delete</button>
          </div>
        </div>
      ))}

      {/* SMART INSIGHTS */}
      <div className="goals-page-insights">
        <strong>Smart Insights</strong>
        <p>
          ⚠️ You need to save <b>₹21,250/month</b> to reach your Vacation goal
        </p>
      </div>
    </div>
  );
}
