import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Goals.css";
import { fetchGoals } from "../../../services/goals.service";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Goals = () => {
    const { session } = useAuth();
    const userId = session?.user?.id || null;
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        if (!userId) {
            setGoal(null);
            return;
        }
        setLoading(true);
        try {
            const rows = await fetchGoals();
            setGoal(rows?.[0] || null);
        } catch (err) {
            setGoal(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!userId) return undefined;

        const channel = supabase
            .channel(`goals-${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "goal_transactions", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [userId, load]);

    const { saved, target, percent, title } = useMemo(() => {
        const savedAmount = Number(goal?.saved_amount || 0);
        const targetAmount = Number(goal?.target_amount || 0) || 1;
        const pct = Math.min(100, Math.round((savedAmount / targetAmount) * 100));
        return {
            saved: savedAmount,
            target: targetAmount,
            percent: pct,
            title: goal?.name || "Create your first goal",
        };
    }, [goal]);

    return (
        <div className="goals-card">
            <div className="goals-header">
                <h3>Goals</h3>
                <button className="bills-manage" onClick={() => navigate("/goals")}>Manage →</button>
            </div>

            <div className="goals-body">
                <span className="goals-label">Top goal</span>
                <h4 className="goals-title">{title}</h4>

                <div className="goals-progress">
                    <div className="goals-progress-fill" style={{ width: `${percent}%` }} />
                    <div className="goals-progress-percent">{percent}%</div>
                </div>

                <div className="goals-meta">
                    ₹{saved.toLocaleString()} <span>of ₹{target.toLocaleString()} saved</span>
                </div>
            </div>

            <button className="goals-cta" disabled={loading}>
                {loading ? "Updating…" : "Show all →"}
            </button>
        </div>
    );
};

export default Goals;
