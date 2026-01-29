import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Insights.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getExpenseStats, getTopCategories } from "../../../services/expenses.service";
import { supabase } from "../../../lib/supabaseClient";

const Insights = () => {
    const { session } = useAuth();
    const userId = session?.user?.id || null;
    const [insight, setInsight] = useState({ delta: 0, direction: "even", top: null });
    const [loading, setLoading] = useState(false);

    const monthRanges = useMemo(() => {
        const now = new Date();
        const curFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const curTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
        const prevTo = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

        return { curFrom, curTo, prevFrom, prevTo };
    }, []);

    const load = useCallback(async () => {
        if (!userId) {
            setInsight({ delta: 0, direction: "even", top: null });
            return;
        }
        setLoading(true);
        try {
            const [curStats, prevStats, topCats] = await Promise.all([
                getExpenseStats(monthRanges.curFrom, monthRanges.curTo, userId),
                getExpenseStats(monthRanges.prevFrom, monthRanges.prevTo, userId),
                getTopCategories({ userId, days: 30 }),
            ]);

            const curTotal = Number(curStats?.data?.total_spent || 0);
            const prevTotal = Number(prevStats?.data?.total_spent || 0);
            const delta = prevTotal ? ((curTotal - prevTotal) / prevTotal) * 100 : curTotal ? 100 : 0;
            const direction = delta > 5 ? "up" : delta < -5 ? "down" : "even";
            setInsight({ delta: Number(delta.toFixed(1)), direction, top: topCats?.[0] || null, curTotal, prevTotal });
        } catch (err) {
            setInsight({ delta: 0, direction: "even", top: null });
        } finally {
            setLoading(false);
        }
    }, [userId, monthRanges]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!userId) return undefined;
        const channel = supabase
            .channel(`insights-${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [userId, load]);

    const headline = useMemo(() => {
        if (insight.direction === "up") return `Your spending is ${insight.delta}% higher than last month.`;
        if (insight.direction === "down") return `Nice! You are spending ${Math.abs(insight.delta)}% less than last month.`;
        return "Your spending is roughly the same as last month.";
    }, [insight]);

    return (
        <div className="insights-card">
            <div className="insights-header">
                <span className="insights-eyebrow">Insights</span>
                <h3 className="insights-title">Your financial overview</h3>
            </div>

            <div className="insights-body">
                <p>
                    {loading ? "Updating…" : headline}
                    {insight.top && (
                        <>
                            {" "}Top category: <strong>{insight.top.name}</strong> (₹{Number(insight.top.value || 0).toLocaleString()}).
                        </>
                    )}
                </p>
            </div>

            <div className="insights-footer">View details →</div>
        </div>
    );
};

export default Insights;
