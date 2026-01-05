import React from "react";
import "./Insights.css";

const Insights = () => {
    return (
        <div className="insights-card">
            <div className="insights-header">
                <span className="insights-eyebrow">Insights</span>
                <h3 className="insights-title">Your financial overview</h3>
            </div>

            <div className="insights-body">
                <p>
                    Your spending is <strong>18% higher</strong> than last month,
                    mainly driven by dining expenses.
                </p>

                <p>
                    On the positive side, your savings rate has improved and
                    you’re still on track with your goals.
                </p>
            </div>

            <div className="insights-footer">
                View details →
            </div>
        </div>
    );
};

export default Insights;
