// import React from "react";
// import "./SubList.css";

// const subscriptions = [
//     {
//         name: "Netflix",
//         date: "15 June 2025",
//         amount: 149,
//         icon: "N",
//         color: "#E50914",
//     },
//     {
//         name: "Spotify",
//         date: "24 Aug 2025",
//         amount: 49,
//         icon: "S",
//         color: "#1DB954",
//     },
//     {
//         name: "Figma",
//         date: "01 Jan 2025",
//         amount: 3999,
//         icon: "F",
//         color: "#A259FF",
//     },
//     {
//         name: "WiFi",
//         date: "11 June 2025",
//         amount: 399,
//         icon: "📶",
//         color: "#EF4444",
//     },
//     {
//         name: "Electricity",
//         date: "31 June 2025",
//         amount: 1265,
//         icon: "⚡",
//         color: "#2563EB",
//     },
// ];

// export default function SubList() {
//     return (
//         <div className="subs-list-card">
//             <div className="subs-list-header">
//                 <div className="subs-list-title">
//                     <span className="subs-list-badge">📄</span>
//                     <h3>Bill & Subscription</h3>
//                 </div>
//                 <button className="subs-list-kebab">⋯</button>
//             </div>

//             <div className="subs-list-items">
//                 {subscriptions.map((item, index) => (
//                     <div key={index} className="subs-list-item">
//                         {/* <div
//                             className="subs-list-icon"
//                             style={{ backgroundColor: item.color }}
//                         >
//                             {item.icon}
//                         </div> */}

//                         <div className="subs-list-info">
//                             <div className="subs-list-name">{item.name}</div>
//                             <div className="subs-list-date">{item.date}</div>
//                         </div>

//                         <div className="subs-list-amount">
//                             ₹{item.amount.toLocaleString()}.00
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

import React, { useCallback, useMemo } from "react";
import "./SubList.css";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../../../contexts/DashboardDataContext";

const currencyFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const SubList = () => {
    const navigate = useNavigate();
    const { subscriptions, loading } = useDashboardData();

    const normalizeDate = useCallback((value) => {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return null;
        parsed.setHours(0, 0, 0, 0);
        return parsed;
    }, []);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const orderedSubs = useMemo(() => {
        const subs = subscriptions || [];
        if (!subs.length) return [];

        return [...subs]
            .sort((a, b) => {
                const aDate = normalizeDate(a.next_due);
                const bDate = normalizeDate(b.next_due);

                if (aDate && !bDate) return -1;
                if (!aDate && bDate) return 1;
                if (!aDate && !bDate) return 0;

                const aOverdue = aDate < today;
                const bOverdue = bDate < today;

                if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

                return aDate - bDate;
            })
                .slice(0, 5);
            }, [normalizeDate, subscriptions, today]);

    const total = useMemo(() => orderedSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0), [orderedSubs]);

    return (
        <div className="bills-card">
            <div className="bills-header">
                <div className="bills-header-left">
                    <h3>Bills & Subscriptions</h3>
                    <button className="bills-manage" onClick={() => navigate("/subscriptions")}>Manage →</button>
                </div>
            </div>

            <div className="bills-total">
                <span className="bills-total-label">Upcoming</span>
                <div className="bills-total-amount">
                    {currencyFmt.format(total)} <span>/ next cycle</span>
                </div>
            </div>

            <div className="bills-list">
                {orderedSubs.length === 0 && (
                    <div className="bills-row empty">
                        {loading ? "Loading subscriptions..." : "No upcoming bills"}
                    </div>
                )}
                {orderedSubs.map((bill, index) => {
                    const billDate = normalizeDate(bill.next_due);
                    const isOverdue = billDate ? billDate < today : false;
                    const dueLabel = billDate ? bill.next_due : "—";

                    return (
                    <div key={bill.id || index} className="bills-row">
                        <div className="bills-left">
                            <span className="bills-name">{bill.name}</span>
                        </div>

                        <div className="bills-right">
                            <span className="bills-amount">{currencyFmt.format(Number(bill.amount || 0))}</span>
                            {bill.status === "inactive" ? (
                                <span className="bills-status paid">Inactive</span>
                            ) : isOverdue ? (
                                <span className="bills-status overdue">Overdue {dueLabel}</span>
                            ) : (
                                <span className="bills-status due">Due {dueLabel}</span>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubList;
