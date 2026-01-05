// import React, { useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";
// import "./TopCategoryDonut.css";

// const data = [
//   { name: "Food & Grocery", value: 6156 },
//   { name: "Investment", value: 5000 },
//   { name: "Shopping", value: 4356 },
//   { name: "Travelling", value: 3670 },
//   { name: "Miscellaneous", value: 2749 },
//   { name: "Bill & Subscription", value: 2162 },
// ];

// const COLORS = [
//   "#4C6EF5",
//   "#FACC15",
//   "#22C55E",
//   "#A855F7",
//   "#F97316",
//   "#06B6D4",
// ];

// export default function TopCategoryDonut() {
//   const [activeIndex, setActiveIndex] = useState(null);

//   return (
//     <div className="top-category-card">
//       <div className="top-category-header">
//         <h3>Top Category</h3>
//         <select className="top-category-dropdown">
//           <option>Recent</option>
//           <option>Last 6 months</option>
//           <option>Last year</option>
//         </select>
//       </div>

//       <div className="top-category-chart">
//         <ResponsiveContainer width="100%" height={260}>
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="value"
//               cx="50%"
//               cy="50%"
//               innerRadius={70}
//               outerRadius={95}
//               activeOuterRadius={103}
//               paddingAngle={3}
//               activeIndex={activeIndex}
//               onMouseEnter={(_, index) => setActiveIndex(index)}
//               onMouseLeave={() => setActiveIndex(null)}
//               isAnimationActive
//               animationDuration={400}
//               animationEasing="ease-out"
//             >
//               {data.map((_, index) => (
//                 <Cell
//                   key={index}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>

//             <Tooltip
//               formatter={(value, name) => [
//                 `₹${value.toLocaleString()}`,
//                 name,
//               ]}
//             />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       <button className="top-category-details">
//         More Details →
//       </button>
//     </div>
//   );
// }

// TopCategoryDonut.jsx

// import React, { useState, useRef } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   Sector,
// } from "recharts";
// import "./TopCategoryDonut.css";

// const data = [
//   { name: "Food & Grocery", value: 6156 },
//   { name: "Investment", value: 5000 },
//   { name: "Shopping", value: 4356 },
//   { name: "Travelling", value: 3670 },
//   { name: "Miscellaneous", value: 2749 },
//   { name: "Bill & Subscription", value: 2162 },
// ];

// const COLORS = [
//   "#4C6EF5",
//   "#FACC15",
//   "#22C55E",
//   "#A855F7",
//   "#F97316",
//   "#06B6D4",
// ];

// const BASE_RADIUS = 95;
// const HOVER_RADIUS = 100;
// const DURATION = 600;

// /* -----------------------------
//    Animated Active Slice ONLY
// ------------------------------ */
// function AnimatedActiveShape(props) {
//   const {
//     cx,
//     cy,
//     innerRadius,
//     outerRadius,
//     startAngle,
//     endAngle,
//     fill,
//   } = props;

//   const [radius, setRadius] = useState(outerRadius);
//   const rafRef = useRef(null);

//   React.useEffect(() => {
//     const start = performance.now();
//     const from = outerRadius;
//     const to = HOVER_RADIUS;

//     const animate = (now) => {
//       const t = Math.min((now - start) / DURATION, 1);
//       const eased = t * (2 - t); // easeOut
//       setRadius(from + (to - from) * eased);

//       if (t < 1) rafRef.current = requestAnimationFrame(animate);
//     };

//     rafRef.current = requestAnimationFrame(animate);

//     return () => cancelAnimationFrame(rafRef.current);
//   }, [outerRadius]);

//   return (
//     <Sector
//       cx={cx}
//       cy={cy}
//       innerRadius={innerRadius}
//       outerRadius={radius}
//       startAngle={startAngle}
//       endAngle={endAngle}
//       fill={fill}
//     />
//   );
// }

// export default function TopCategoryDonut() {
//   const [activeIndex, setActiveIndex] = useState(null);

//   return (
//     <div className="top-category-card">
//       <div className="top-category-header">
//         <h3>Top Category</h3>
//         <select className="top-category-dropdown">
//           <option>Recent</option>
//           <option>Last 6 months</option>
//           <option>Last year</option>
//         </select>
//       </div>

//       <div className="top-category-chart">
//         <ResponsiveContainer width="100%" height={260}>
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="value"
//               cx="50%"
//               cy="50%"
//               innerRadius={70}
//               outerRadius={BASE_RADIUS}
//               paddingAngle={3}
//               activeIndex={activeIndex}
//               activeShape={AnimatedActiveShape}
//               onMouseEnter={(_, i) => setActiveIndex(i)}
//               onMouseLeave={() => setActiveIndex(null)}
//               isAnimationActive={false}
//             >
//               {data.map((_, index) => (
//                 <Cell
//                   key={index}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>

//             <Tooltip
//               formatter={(value, name) => [
//                 `₹${value.toLocaleString()}`,
//                 name,
//               ]}
//             />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       <button className="top-category-details">
//         More Details →
//       </button>
//     </div>
//   );
// }

// import React, { useState, useRef, useEffect } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   Sector,
// } from "recharts";
// import "./TopCategoryDonut.css";

// const data = [
//   { name: "Food & Grocery", value: 6156 },
//   { name: "Investment", value: 5000 },
//   { name: "Shopping", value: 4356 },
//   { name: "Travelling", value: 3670 },
//   { name: "Miscellaneous", value: 2749 },
//   { name: "Bill & Subscription", value: 2162 },
// ];

// const COLORS = [
//   "#4C6EF5",
//   "#FACC15",
//   "#22C55E",
//   "#A855F7",
//   "#F97316",
//   "#06B6D4",
// ];

// const BASE_RADIUS = 95;
// const HOVER_RADIUS = 100;
// const OFFSET = 8;          // 👈 sideways push
// const DURATION = 600;

// /* -----------------------------
//    Animated Active Slice ONLY
// ------------------------------ */
// function AnimatedActiveShape(props) {
//   const {
//     cx,
//     cy,
//     innerRadius,
//     outerRadius,
//     startAngle,
//     endAngle,
//     fill,
//   } = props;

//   const [radius, setRadius] = useState(outerRadius);
//   const [offset, setOffset] = useState(0);
//   const rafRef = useRef(null);

//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);

//     const start = performance.now();
//     const fromR = outerRadius;
//     const toR = HOVER_RADIUS;

//     const fromO = 0;
//     const toO = OFFSET;

//     const animate = (now) => {
//       const t = Math.min((now - start) / DURATION, 1);
//       const eased = t * (2 - t); // easeOut

//       setRadius(fromR + (toR - fromR) * eased);
//       setOffset(fromO + (toO - fromO) * eased);

//       if (t < 1) rafRef.current = requestAnimationFrame(animate);
//     };

//     rafRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [outerRadius]);

//   const midAngle = (startAngle + endAngle) / 2;
//   const RADIAN = Math.PI / 180;

//   const dx = Math.cos(-midAngle * RADIAN) * offset;
//   const dy = Math.sin(-midAngle * RADIAN) * offset;

//   return (
//     <Sector
//       cx={cx + dx}
//       cy={cy + dy}
//       innerRadius={innerRadius}
//       outerRadius={radius}
//       startAngle={startAngle}
//       endAngle={endAngle}
//       fill={fill}
//     />
//   );
// }

// export default function TopCategoryDonut() {
//   const [activeIndex, setActiveIndex] = useState(null);

//   return (
//     <div className="top-category-card">
//       <div className="top-category-header">
//         <h3>Top Category</h3>
//         <select className="top-category-dropdown">
//           <option>Recent</option>
//           <option>Last 6 months</option>
//           <option>Last year</option>
//         </select>
//       </div>

//       <div className="top-category-chart">
//         <ResponsiveContainer width="100%" height={260}>
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="value"
//               cx="50%"
//               cy="50%"
//               innerRadius={70}
//               outerRadius={BASE_RADIUS}
//               paddingAngle={3}
//               activeIndex={activeIndex}
//               activeShape={AnimatedActiveShape}
//               onMouseEnter={(_, i) => setActiveIndex(i)}
//               onMouseLeave={() => setActiveIndex(null)}
//               isAnimationActive={false}
//             >
//               {data.map((_, index) => (
//                 <Cell
//                   key={index}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>

//             <Tooltip
//               formatter={(value, name) => [
//                 `₹${value.toLocaleString()}`,
//                 name,
//               ]}
//             />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       <button className="top-category-details">
//         More Details →
//       </button>
//     </div>
//   );
// }

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
