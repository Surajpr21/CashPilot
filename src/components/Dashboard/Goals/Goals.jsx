import React from "react";
import "./Goals.css";

const Goals = () => {
    const saved = 2870;
    const target = 4000;
    const percent = Math.round((saved / target) * 100);

    return (
        <div className="goals-card">
            {/* Header */}
            <div className="goals-header">
                <h3>Goals</h3>
            </div>

            {/* Content */}
            <div className="goals-body">
                <span className="goals-label">Top goal</span>
                <h4 className="goals-title">Reduce overhead costs</h4>

                {/* Progress */}
                <div className="goals-progress">
                    <div
                        className="goals-progress-fill"
                        style={{ width: `${percent}%` }}
                    />
                    <div className="goals-progress-percent">
                        {percent}%
                    </div>
                </div>

                {/* Meta */}
                <div className="goals-meta">
                    ₹{saved.toLocaleString()}{" "}
                    <span>of ₹{target.toLocaleString()} saved</span>
                </div>
            </div>

            {/* CTA */}
            <button className="goals-cta">
                Show all →
            </button>
        </div>
    );
};

export default Goals;
