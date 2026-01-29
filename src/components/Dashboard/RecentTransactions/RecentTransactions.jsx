import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./RecentTransactions.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getRecentExpenses } from "../../../services/expenses.service";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const currencyFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const RecentTransactions = () => {
    const { session } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const userId = session?.user?.id || null;

    const load = useCallback(async () => {
        if (!userId) {
            setTransactions([]);
            return;
        }
        setLoading(true);
        try {
            const rows = await getRecentExpenses({ userId, limit: 5 });
            setTransactions(rows || []);
        } catch (err) {
            setTransactions([]);
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
            .channel(`recent-expenses-${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
                () => load()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, load]);

    const rows = useMemo(() => transactions ?? [], [transactions]);

    return (
        <div className="recent-trans-card">
            <div className="recent-trans-header">
                <h3>Recent Expenses</h3>

                <div className="recent-trans-actions">
                    <button className="bills-manage" onClick={() => navigate("/expenses")}>Manage →</button>
                    <button className="recent-trans-btn" onClick={load} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                    <select className="recent-trans-select" disabled>
                        <option>Recent</option>
                    </select>
                </div>
            </div>

            <div className="recent-trans-table-wrapper">
                <table className="recent-trans-table">
                    <thead>
                        <tr>
                            <th>S.N</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th className="hide-sm">Note</th>
                            <th>Date</th>
                            <th className="hide-md">Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="empty">
                                    {loading ? "Loading expenses..." : "No expenses recorded yet"}
                                </td>
                            </tr>
                        )}
                        {rows.map((tx, index) => (
                            <tr key={tx.id || index}>
                                <td>{index + 1}</td>
                                <td className="amount">{currencyFmt.format(Number(tx.amount || 0))}</td>
                                <td>{tx.category || "Uncategorized"}</td>
                                <td className="hide-sm">{tx.note || "—"}</td>
                                <td>{tx.spent_at}</td>
                                <td className="hide-md">{tx.payment_mode || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactions;
