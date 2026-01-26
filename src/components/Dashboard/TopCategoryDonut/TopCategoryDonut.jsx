import React, { useState, useMemo } from "react";
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
  { name: "Miscellaneous & Other Expenses", value: 2749 },
];

const GRADIENTS = [
  { from: "#CDE7A2", to: "#90D087" }, // lime-mint
  { from: "#FFE6A8", to: "#F4C86A" }, // apricot-yellow
  { from: "#B7EFE5", to: "#6ECFBC" }, // aqua-teal
  { from: "#BEE6FF", to: "#7CB8E8" }, // cyan-blue
  { from: "#C9C8FF", to: "#8EA2F6" }, // lavender-blue
];




// SVG arrow component
const UpArrowIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
  </svg>
);

// color lightener
const lighten = (hex, amount = 0.18) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
  const b = Math.min(255, (num & 0xff) + 255 * amount);
  return `rgb(${r}, ${g}, ${b})`;
};


export default function TopCategoryDonut() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [range, setRange] = useState("30");

  const topCategory = useMemo(
    () =>
      data.reduce((max, item) =>
        item.value > max.value ? item : max
      ),
    []
  );

  return (
    <div className="donut-card">
      <div className="donut-header">
        <h3 className="donut-title">Top category</h3>
        <select
          className="donut-dropdown"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="30">Last 30 days</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last 1 year</option>
        </select>
      </div>

      <div className="donut-wrapper">
        <ResponsiveContainer width={260} height={260}>
          <PieChart>

            {/* ------- GRADIENT DEFINITIONS ------- */}
            <defs>
              {GRADIENTS.map((g, i) => (
                <linearGradient
                  key={i}
                  id={`donut-grad-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              ))}

              {/* lighter hover version */}
              {GRADIENTS.map((g, i) => (
                <linearGradient
                  key={`active-${i}`}
                  id={`donut-grad-active-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
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
                    fill={`url(#${isActive
                        ? `donut-grad-active-${i}`
                        : `donut-grad-${i}`
                      })`}
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
              formatter={(value, _, props) => [
                `₹${value.toLocaleString()}`,
                props.payload.name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>


        {/* CENTER */}
        <div className="donut-center">
          <div className="donut-center-amount">
            <UpArrowIcon className="donut-arrow-icon" />
            <span className="donut-value">
              ${topCategory.value.toLocaleString()}
            </span>
          </div>

          <div
            className="donut-center-label"
            title={topCategory.name}
          >
            {topCategory.name}
          </div>
        </div>
      </div>
    </div>
  );
}
