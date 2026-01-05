import React from "react";
import "./RecentTransactions.css";

const transactions = [
    {
        id: 1,
        amount: "₹2,100.00",
        category: "Shopping",
        subCategory: "Amazon",
        date: "31 May 2025",
        mode: "UPI",
    },
    {
        id: 2,
        amount: "₹299.00",
        category: "Movie",
        subCategory: "PVR",
        date: "28 May 2025",
        mode: "UPI",
    },
    {
        id: 3,
        amount: "₹5,000.00",
        category: "Investment",
        subCategory: "Groww",
        date: "24 May 2025",
        mode: "Bank",
    },
    {
        id: 4,
        amount: "₹2,460.00",
        category: "Travel",
        subCategory: "IRCTC",
        date: "20 May 2025",
        mode: "Card",
    },
    {
        id: 5,
        amount: "₹678.00",
        category: "Food",
        subCategory: "Swiggy",
        date: "15 May 2025",
        mode: "UPI",
    },
];

const RecentTransactions = () => {
    return (
        <div className="recent-trans-card">
            <div className="recent-trans-header">
                <h3>Recent Expenses</h3>

                <div className="recent-trans-actions">
                    <button className="recent-trans-btn">Filter</button>
                    <select className="recent-trans-select">
                        <option>Recent</option>
                        <option>Oldest</option>
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
                            <th className="hide-sm">Sub Category</th>
                            <th>Date</th>
                            <th className="hide-md">Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={tx.id}>
                                <td>{index + 1}</td>
                                <td className="amount">{tx.amount}</td>
                                <td>{tx.category}</td>
                                <td className="hide-sm">{tx.subCategory}</td>
                                <td>{tx.date}</td>
                                <td className="hide-md">{tx.mode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentTransactions;
