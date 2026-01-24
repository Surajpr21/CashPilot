import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./AllocationCard.css";

const GRADIENTS = [
  { from: "#CDE7A2", to: "#90D087" }, // lime-mint (investments)
  { from: "#FFE6A8", to: "#F4C86A" }, // apricot-yellow (gold)
  { from: "#B7EFE5", to: "#6ECFBC" }, // aqua-teal (insurance)
];

const lighten = (hex, amount = 0.18) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
  const b = Math.min(255, (num & 0xff) + 255 * amount);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function AllocationCard() {
  const [activeIndex, setActiveIndex] = useState(null);

  const data = useMemo(
    () => [
      { name: "Investments", value: 55 },
      { name: "Gold", value: 25 },
      { name: "Insurance", value: 20 },
    ],
    []
  );

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3 className="assets-page-title">Allocation (by amount)</h3>
        <span className="assets-page-dots">•••</span>
      </div>

      <div className="assets-page-donut-wrap">
        <ResponsiveContainer width={260} height={260}>
          <PieChart>
            <defs>
              {GRADIENTS.map((g, i) => (
                <linearGradient key={i} id={`assets-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              ))}
              {GRADIENTS.map((g, i) => (
                <linearGradient key={`active-${i}`} id={`assets-grad-active-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(g.from)} />
                  <stop offset="100%" stopColor={lighten(g.to)} />
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={110}
              paddingAngle={2.5}
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, i) => {
                const isActive = i === activeIndex;
                return (
                  <Cell
                    key={i}
                    fill={`url(#${isActive ? `assets-grad-active-${i}` : `assets-grad-${i}`})`}
                    cornerRadius={6}
                    style={{ transition: "fill 400ms ease" }}
                  />
                );
              })}
            </Pie>

            <Tooltip
              wrapperStyle={{ zIndex: 1000 }}
              contentStyle={{
                background: "#ffffff",
                border: "none",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: "8px 12px",
              }}
              labelStyle={{ display: "none" }}
              itemStyle={{ fontSize: "0.85rem", color: "#374151" }}
              formatter={(value, _, props) => [`${value}%`, props.payload.name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="assets-page-donut-center">
          <div className="assets-page-center-value">₹8,75,500</div>
          <div className="assets-page-center-label">Total assets</div>
        </div>
      </div>

      <div className="assets-page-legend">
        <span className="investments">Investments</span>
        <span className="gold">Gold</span>
        <span className="insurance">Insurance</span>
      </div>

      <p className="assets-page-footnote">Based on invested amount and total premiums paid</p>
    </div>
  );
}
