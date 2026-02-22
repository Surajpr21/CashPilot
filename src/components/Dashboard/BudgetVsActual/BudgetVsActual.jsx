import React, { useMemo } from "react";
import "./BudgetVsActual.css";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../../../contexts/DashboardDataContext";

const getBarColor = (totalPercent) => {
    if (totalPercent < 70) return "#9FD2A8";
    if (totalPercent <= 100) return "#F4C463";
    return "#E46A63";
};

const getPercentColor = (totalPercent) => {
    return totalPercent > 100 ? "#2E2E2E" : "#2E2E2E";
};

const getPercentBackground = (totalPercent) => {
    if (totalPercent < 70) return "#9FD2A8";      // Safe
    if (totalPercent <= 100) return "#F4C463";    // Approaching limit
    return "#E46A63";                             // Overspent
};

const getRowBarColor = (pct) => {
    if (pct < 70) return "#9FD2A8";
    if (pct <= 100) return "#F4C463";
    return "#E46A63";
};

const getTrackColor = (pct) => {
    if (pct < 70) return "#CFE8D7";   // soft green tint
    if (pct <= 100) return "#FAE8B8"; // soft amber tint
    return "#F3C3BC";                 // soft red tint
};




const BudgetVsActual = () => {
    const navigate = useNavigate();
    const { budgetSummary, loading } = useDashboardData();

    const categories = useMemo(() => budgetSummary?.categories || [], [budgetSummary?.categories]);

    const totalBudget = budgetSummary?.totalBudget ?? 0;
    const totalActual = budgetSummary?.totalActual ?? 0;

    const totalPercent = useMemo(() => {
        if (!totalBudget) return 0;
        return Math.round((totalActual / totalBudget) * 100);
    }, [totalActual, totalBudget]);

    return (
        <div className="budget-card">
            <div className="budget-header">
                <h3>Budget vs Actual</h3>
                <div className="budget-header-actions">
                    <button className="bills-manage" onClick={() => navigate("/budgets")}>Manage →</button>
                    <button className="budget-filter" disabled>
                        This month ▾
                    </button>
                </div>
            </div>

            <div className="budget-total-row">
                <span>Total</span>
                <div className="budget-total-values">
                    <span>₹{totalBudget.toLocaleString()}</span>
                    <span>₹{totalActual.toLocaleString()}</span>
                </div>
            </div>

            <div className="budget-total-bar">
                <div className="budget-total-budget" style={{ backgroundColor: getTrackColor(totalPercent) }}>
                    <div
                        className="budget-total-actual"
                        style={{
                            width: `${Math.min(totalPercent, 100)}%`,
                            backgroundColor: getBarColor(totalPercent),
                        }}
                    />
                </div>

                <span
                    className="budget-total-percent"
                    style={{
                        backgroundColor: getPercentBackground(totalPercent),
                        color: getPercentColor(totalPercent),
                    }}
                >
                    {totalPercent}%
                </span>
            </div>

            <div className="budget-list">
                {categories.length === 0 && !loading && (
                    <div className="budget-empty">No budget data for this month.</div>
                )}
                {categories.map((c, i) => {
                    const pct = c.budget ? (c.actual / c.budget) * 100 : 0;

                    return (
                        <div key={i} className="budget-row">
                            <span className="budget-name">{c.name}</span>

                            <div className="budget-bar">
                                <div className="budget-bar-budget" style={{ backgroundColor: getTrackColor(pct || 0) }}>
                                    <div
                                        className="budget-bar-actual"
                                        style={{
                                            width: `${Math.min(pct || 0, 100)}%`,
                                            backgroundColor: getRowBarColor(pct || 0),
                                        }}
                                    />
                                </div>
                            </div>

                            <span className="budget-value">₹{Number(c.actual || 0).toLocaleString()}</span>
                        </div>
                    );
                })}
            </div>

            <div className="budget-footer">
                <div>
                    <span>Budget</span>
                    <strong>₹{totalBudget.toLocaleString()}</strong>
                </div>
                <div className="budget-footer-actual">
                    <span>Actual</span>
                    <strong>₹{totalActual.toLocaleString()}</strong>
                </div>
            </div>
            {loading && <div className="budget-loading">Refreshing…</div>}
        </div>
    );
};

export default BudgetVsActual;

