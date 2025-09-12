import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./MonthlyExpensesChart.css";

const data = [
  { name: "Dec", expense: 18000 },
  { name: "Feb", expense: 27000 },
  { name: "Mar", expense: 8000 },
  { name: "Apr", expense: 20000 },
  { name: "May", expense: 26000 },
  { name: "Jan", expense: 15000 },
];

export default function MonthlyExpensesChart() {
  return (
    <div className="monthly-expenses-card">
      <div className="monthly-expenses-header">
        <h3>Monthly Expenses</h3>
        <div className="monthly-expenses-info">
          <span className="monthly-expenses-growth">▲ 6% more than last month</span>
          <select className="monthly-expenses-dropdown">
            <option>Recent</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip />
          <Bar dataKey="expense" fill="#4C6EF5" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
