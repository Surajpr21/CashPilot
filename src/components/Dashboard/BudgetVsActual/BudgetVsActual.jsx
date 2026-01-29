import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./BudgetVsActual.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getBudgetsByMonth } from "../../../services/budgets.service";
import { getActualSpendByCategory } from "../../../services/budgetActuals.service";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const fallbackCategories = [
    { name: "Marketing", budget: 3000, actual: 2400 },
    { name: "Salaries", budget: 2000, actual: 1800 },
    { name: "Office Rent", budget: 1500, actual: 1500 },
    { name: "Software", budget: 1500, actual: 550 },
];

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
    const { session } = useAuth();
    const userId = session?.user?.id || null;
    const [categories, setCategories] = useState(fallbackCategories);
    const [totalBudget, setTotalBudget] = useState(8000);
    const [totalActual, setTotalActual] = useState(5450);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const monthStart = useMemo(() => {
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        return key;
    }, []);

    const monthEnd = useMemo(() => {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
        return end;
    }, []);

    const load = useCallback(async () => {
        if (!userId) {
            setCategories(fallbackCategories);
            setTotalBudget(8000);
            setTotalActual(5450);
            return;
        }

        setLoading(true);
        try {
            const [budgets, actuals] = await Promise.all([
                getBudgetsByMonth(monthStart),
                getActualSpendByCategory(monthStart, monthEnd, userId),
            ]);

            const budgetRows = Array.isArray(budgets) ? budgets : [];
            const actualMap = actuals || {};

            const merged = budgetRows.map((b) => ({
                name: b.category,
                budget: Number(b.amount || 0),
                actual: Number(actualMap[b.category] || 0),
            }));

            const extraActuals = Object.entries(actualMap)
                .filter(([cat]) => !budgetRows.find((b) => b.category === cat))
                .map(([cat, value]) => ({ name: cat, budget: 0, actual: Number(value) }));

            const allCats = [...merged, ...extraActuals];

            const budgetSum = allCats.reduce((sum, c) => sum + Number(c.budget || 0), 0);
            const actualSum = allCats.reduce((sum, c) => sum + Number(c.actual || 0), 0);

            const limited = allCats.slice(0, 5);
            setCategories(limited.length ? limited : fallbackCategories);
            setTotalBudget(budgetSum || 0);
            setTotalActual(actualSum || 0);
        } catch (err) {
            setCategories(fallbackCategories);
            setTotalBudget(8000);
            setTotalActual(5450);
        } finally {
            setLoading(false);
        }
    }, [userId, monthStart, monthEnd]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!userId) return undefined;

        const channel = supabase
            .channel(`budget-actual-${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "budgets", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [userId, load]);

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

