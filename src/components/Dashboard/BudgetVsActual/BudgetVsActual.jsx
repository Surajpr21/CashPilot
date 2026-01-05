import React from "react";
import "./BudgetVsActual.css";

const categories = [
    { name: "Marketing", budget: 3000, actual: 2400 },
    { name: "Salaries", budget: 2000, actual: 1800 },
    { name: "Office Rent", budget: 1500, actual: 1500 },
    { name: "Software", budget: 1500, actual: 550 },
];

const totalBudget = 8000;
const totalActual = 5450;
const totalPercent = Math.round((totalActual / totalBudget) * 100);

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
    return (
        <div className="budget-card">

            <div className="budget-header">
                <h3>Budget vs Actual</h3>
                <button className="budget-filter">This month ▾</button>
            </div>


            <div className="budget-total-row">
                <span>Total</span>
                <div className="budget-total-values">
                    <span>${totalBudget.toLocaleString()}</span>
                    <span>${totalActual.toLocaleString()}</span>
                </div>
            </div>

            <div className="budget-total-bar">
                <div className="budget-total-budget" style={{ backgroundColor: getTrackColor(totalPercent) }}>
                    <div
                        className="budget-total-actual"
                        style={{
                            width: `${Math.min(totalPercent, 100)}%`,
                            backgroundColor: getBarColor(totalPercent)
                        }}
                    />
                </div>

                <span
                    className="budget-total-percent"
                    style={{
                        backgroundColor: getPercentBackground(totalPercent),
                        color: getPercentColor(totalPercent)
                    }}
                >
                    {totalPercent}%
                </span>

            </div>




            <div className="budget-list">
                {categories.map((c, i) => {
                    const pct = (c.actual / c.budget) * 100;

                    return (
                        <div key={i} className="budget-row">
                            <span className="budget-name">{c.name}</span>

                            <div className="budget-bar">
                                <div className="budget-bar-budget" style={{ backgroundColor: getTrackColor(pct) }}>
                                    <div
                                        className="budget-bar-actual"
                                        style={{
                                            width: `${Math.min(pct, 100)}%`,
                                            backgroundColor: getRowBarColor(pct)
                                        }}
                                    />
                                </div>
                            </div>

                            <span className="budget-value">
                                ${c.actual.toLocaleString()}
                            </span>
                        </div>
                    );

                })}
            </div>


            <div className="budget-footer">
                <div>
                    <span>Budget</span>
                    <strong>${totalBudget.toLocaleString()}</strong>
                </div>
                <div className="budget-footer-actual">
                    <span>Actual</span>
                    <strong>↑ ${totalActual - totalBudget}</strong>
                </div>
            </div>
        </div>
    );
};

export default BudgetVsActual;

