import React from "react";
import "./GoalsPage.css";
import GoalsSection from "./GoalsPage/GoalsSection";

export default function GoalsPage() {
  return (
    <div className="goals-page-wrapper">
      {/* Header */}
      <div className="goals-page-header">
        <div>
          <h1 className="goals-page-title">Goals</h1>
          <p className="goals-page-subtitle">
            Track progress toward your financial targets
          </p>
        </div>

        <button className="goals-page-create-btn">
          + Create Goal
        </button>
      </div>

      {/* Goals Section */}
      <GoalsSection />
    </div>
  );
}
