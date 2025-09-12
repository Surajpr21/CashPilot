import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./TopCategoryDonut.css";

const data = [
  { name: "Food & Grocery", value: 6156 },
  { name: "Investment", value: 5000 },
  { name: "Shopping", value: 4356 },
  { name: "Travelling", value: 3670 },
  { name: "Miscellaneous", value: 2749 },
  { name: "Bill & Subscription", value: 2162 },
];

const COLORS = ["#4C6EF5", "#FACC15", "#22C55E", "#A855F7", "#F97316", "#06B6D4"];

export default function TopCategoryDonut() {
  return (
    <div className="top-category-card">
      <div className="top-category-header">
        <h3>Top Category</h3>
        <select className="top-category-dropdown">
          <option>Recent</option>
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="top-category-body">
        <div className="top-category-chart">
          <ResponsiveContainer width={450} height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                 innerRadius="70%"
        outerRadius="90%"
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="top-category-list">
          {data.map((item, index) => (
            <div key={index} className="top-category-item">
              <span
                className="top-category-color"
                style={{ backgroundColor: COLORS[index] }}
              ></span>
              <span className="top-category-name">{item.name}</span>
              <span className="top-category-value">₹{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="top-category-details">More Details →</button>
    </div>
  );
}
