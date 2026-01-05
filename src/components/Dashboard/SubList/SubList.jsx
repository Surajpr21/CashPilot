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

import React from "react";
import "./SubList.css";

const bills = [
    {
        name: "Slack",
        icon: "🟢", // replace with svg/logo if needed
        date: "Jun 25",
        amount: 80,
        status: "due",
    },
    {
        name: "Adobe Creative Cloud",
        icon: "🔴",
        date: "Tomorrow",
        amount: 60,
        status: "paid",
    },
    {
        name: "Dropbox",
        icon: "🔷",
        date: "Jun 20",
        amount: 120,
        status: "overdue",
    },
    {
        name: "Google Workspace",
        icon: "🟡",
        date: "Jun 17",
        amount: 220,
        status: "paid",
    },
];

const SubList = () => {
    return (
        <div className="bills-card">
            {/* Header */}
            <div className="bills-header">
                <div className="bills-header-left">
                    <h3>Bills & Subscriptions</h3>
                      <button className="bills-manage">
                    Manage →
                </button>
                </div>
            </div>

            {/* Total */}
            <div className="bills-total">
                <span className="bills-total-label">Total</span>
                <div className="bills-total-amount">
                    $480 <span>/ month</span>
                </div>
            </div>

            {/* List */}
            <div className="bills-list">
                {bills.map((bill, index) => (
                    <div key={index} className="bills-row">
                        <div className="bills-left">
                            <span className="bills-name">{bill.name}</span>
                        </div>

                        <div className="bills-right">
                            {/* <span className="bills-date">
                                 {bill.date}
                            </span> */}
                            <span className="bills-amount">
                                ${bill.amount}
                            </span>

                            {bill.status === "due" ? (
                                <span className="bills-status due">
                                    Due soon
                                </span>
                            ) : bill.status === "overdue" ? (
                                <span className="bills-status overdue">
                                    Overdue
                                </span>
                            ) : (
                                <span className="bills-status paid">
                                    Paid
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubList;
