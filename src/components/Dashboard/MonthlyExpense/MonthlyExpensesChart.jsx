// // MonthlyExpensesChart.jsx
// import React, { useRef, useEffect, useState } from "react";
// import "./MonthlyExpensesChart.css";

// const data = [
//   { name: "Dec", expense: 18000 },
//   { name: "Feb", expense: 27000 },
//   { name: "Mar", expense: 8000 },
//   { name: "Apr", expense: 20000 },
//   { name: "May", expense: 26000 },
//   { name: "Jan", expense: 15000 },
// ];

// export default function MonthlyExpensesChart() {
//   const containerRef = useRef(null);
//   const [width, setWidth] = useState(900);
//   const height = 320;

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;
//     const resize = () => setWidth(el.clientWidth || 600);

//     if (typeof ResizeObserver !== "undefined") {
//       const ro = new ResizeObserver(() => resize());
//       ro.observe(el);
//       resize();
//       return () => ro.disconnect();
//     } else {
//       window.addEventListener("resize", resize);
//       resize();
//       return () => window.removeEventListener("resize", resize);
//     }
//   }, []);

//   const padding = { top: 18, right: 18, bottom: 46, left: 50 };
//   const chartW = Math.max(0, width - padding.left - padding.right);
//   const chartH = Math.max(0, height - padding.top - padding.bottom);
//   const values = data.map((d) => d.expense);
//   const maxVal = Math.max(...values, 30000);
//   const domainMax = Math.ceil(maxVal / 5000) * 5000;

//   // y ticks (0 .. domainMax) - we render 7 ticks (including 0)
//   const ticks = Array.from({ length: 7 }, (_, i) => Math.round((i * domainMax) / 6));

//   const band = chartW / data.length;
//   const barWidth = Math.min(72, Math.max(28, band * 0.5));
//   const bgPaddingVert = 8; // visual padding inside the background pill
//   const innerHorizPadding = 10;

//   const [tooltip, setTooltip] = useState(null);

//   return (
//     <div className="monthly-expenses-card" ref={containerRef}>
//       <div className="monthly-expenses-header">
//         <h3>Monthly Expenses</h3>
//         <div className="monthly-expenses-info">
//           <span className="chip growth">▲ 6% more than last month</span>
//           <select className="monthly-expenses-dropdown" aria-label="range">
//             <option>Recent</option>
//             <option>Last 6 months</option>
//             <option>Last year</option>
//           </select>
//           <button className="kebab" aria-label="more">
//             ⋯
//           </button>
//         </div>
//       </div>

//       <div className="chart-wrap" style={{ height }}>
//         <svg
//           width={width}
//           height={height}
//           className="expenses-svg"
//           role="img"
//           aria-label="Monthly expenses chart"
//         >
//           <defs>
//             <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
//               <stop offset="0%" stopColor="#4C6EF5" stopOpacity="1" />
//               <stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
//             </linearGradient>

//             <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
//               <feDropShadow
//                 dx="0"
//                 dy="2"
//                 stdDeviation="6"
//                 floodColor="#6b5cff"
//                 floodOpacity="0.12"
//               />
//             </filter>
//           </defs>

//           {/* Y axis labels + subtle horizontal grid */}
//           {ticks.map((t, idx) => {
//             const y = padding.top + chartH - (t / domainMax) * chartH;
//             return (
//               <g key={idx}>
//                 <line
//                   x1={padding.left - 6}
//                   x2={width - padding.right}
//                   y1={y}
//                   y2={y}
//                   stroke="#f3f4f6"
//                   strokeWidth={1}
//                 />
//                 <text x={padding.left - 12} y={y + 4} textAnchor="end" className="tick-label">
//                   {Number(t).toLocaleString()}
//                 </text>
//               </g>
//             );
//           })}

//           {/* Bars (background pill + inner value bar) */}
//           {data.map((d, i) => {
//             const cx = padding.left + band * i + band / 2;
//             const bgX = cx - barWidth / 2;
//             const bgY = padding.top + bgPaddingVert;
//             const bgHeight = chartH - bgPaddingVert * 2;
//             const innerWidth = Math.max(8, barWidth - innerHorizPadding * 2);
//             const innerHeight = Math.max(6, Math.round((d.expense / domainMax) * bgHeight));
//             const innerX = cx - innerWidth / 2;
//             const innerY = bgY + (bgHeight - innerHeight);

//             return (

//               <g
//                 key={d.name}
//                 className="bar-group"
//                 onMouseEnter={(e) => {
//                   const rect = containerRef.current.getBoundingClientRect();
//                   setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, value: d.expense, label: d.name });
//                 }}
//                 onMouseLeave={() => setTooltip(null)}
//               >
//                 {/* background pill */}
//                 <rect x={bgX} y={bgY} width={barWidth} height={bgHeight} rx={barWidth / 2} ry={barWidth / 2} fill="#f3efff" />

//                 {/* inner value bar */}
//                 <rect
//                   x={innerX}
//                   y={innerY}
//                   width={innerWidth}
//                   height={innerHeight}
//                   rx={innerWidth / 2}
//                   ry={innerWidth / 2}
//                   fill="url(#barGradient)"
//                   filter="url(#softShadow)"
//                   style={{ transition: "all 450ms cubic-bezier(.2,.8,.2,1)" }}
//                 />

//                 {/* x label */}
//                 <text x={cx} y={padding.top + chartH + 20} textAnchor="middle" className="x-label">
//                   {d.name}
//                 </text>
//               </g>
//             );
//           })}

//           {/* bottom-left small label */}
//           <text x={padding.left - 6} y={padding.top + chartH + 20} textAnchor="end" className="x-label small">
//             E/M
//           </text>
//         </svg>

//         {/* tooltip */}
//         {tooltip && (
//           <div className="chart-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}>
//             <div className="tt-label">{tooltip.label}</div>
//             <div className="tt-value">₹{tooltip.value.toLocaleString()}</div>

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useRef, useEffect, useState } from "react";
import "./MonthlyExpensesChart.css";

const SERIES = {
  expenses: {
    label: "Monthly Expenses",
    chip: "▲ 6% more than last month",
    color: {
      line: "#99C0F6",
      point: "#4C6EF5",
      areaTop: "#3CA8D6",
      areaBottom: "#D3F2BD",
    },
    data: [
      { name: "Jan", value: 15000 },
      { name: "Feb", value: 27000 },
      { name: "Mar", value: 8000 },
      { name: "Apr", value: 20000 },
      { name: "May", value: 26000 },
      { name: "Jun", value: 18000 },
      { name: "Jul", value: 22000 },
      { name: "Aug", value: 24000 },
      { name: "Sep", value: 21000 },
      { name: "Oct", value: 23000 },
      { name: "Nov", value: 25000 },
      { name: "Dec", value: 19000 },
    ],
  },
  savings: {
    label: "Monthly Savings",
    chip: "▲ 12% higher than average",
    color: {
      line: "#99C0F6",
      point: "#4C6EF5",
      areaTop: "#3CA8D6",
      areaBottom: "#D3F2BD",
    },
    data: [
      { name: "Jan", value: 7000 },
      { name: "Feb", value: 11000 },
      { name: "Mar", value: 9500 },
      { name: "Apr", value: 14000 },
      { name: "May", value: 16000 },
      { name: "Jun", value: 17500 },
      { name: "Jul", value: 18000 },
      { name: "Aug", value: 20000 },
      { name: "Sep", value: 22000 },
      { name: "Oct", value: 24000 },
      { name: "Nov", value: 26000 },
      { name: "Dec", value: 28000 },
    ],
  },
};

export default function MonthlyExpensesChart() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(900);
  const height = 320;
  const [mode, setMode] = useState("expenses");
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resize = () => setWidth(el.clientWidth || 600);

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();
      return () => ro.disconnect();
    } else {
      window.addEventListener("resize", resize);
      resize();
      return () => window.removeEventListener("resize", resize);
    }
  }, []);

  const padding = { top: 18, right: 18, bottom: 46, left: 50 };
  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = Math.max(0, height - padding.top - padding.bottom);

  const currentSeries = SERIES[mode];
  const values = currentSeries.data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const domainMax = Math.ceil(maxVal / 5000) * 5000 * 1.08;
  const rightInset = 32; // subtle, not visible as padding


  const ticks = Array.from({ length: 7 }, (_, i) =>
    Math.round((i * domainMax) / 6)
  );

  const getX = (i) =>
    padding.left +
    ((chartW - rightInset) / (currentSeries.data.length - 1)) * i;


  // --- Line points ---
  const points = currentSeries.data.map((d, i) => {
    const x = getX(i);
    const y =
      padding.top +
      chartH -
      (d.value / domainMax) * chartH;

    return { x, y, value: d.value, label: d.name };
  });




  // --- Smooth bezier path ---
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${path} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padding.top + chartH}` +
    ` L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="monthly-expenses-card" ref={containerRef}>
      <div className="monthly-expenses-header">
        <h3>{currentSeries.label}</h3>
        <div className="monthly-expenses-info">
          <span className="chip growth">{currentSeries.chip}</span>
          <div className="toggle">
            {[
              { id: "expenses", label: "Expenses" },
              { id: "savings", label: "Savings" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`toggle-pill ${mode === option.id ? "active" : ""}`}
                onClick={() => setMode(option.id)}
                aria-pressed={mode === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select className="monthly-expenses-dropdown" aria-label="range">
            <option>Recent</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="chart-wrap" style={{ height }}>
        <svg width={width} height={height} className="expenses-svg">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3CA8D6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D3F2BD" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="fadeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="10%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>



            <linearGradient
              id="lineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="80%" stopColor="#99C0F6" />
              <stop offset="90%" stopColor="#D3F2BD" />
            </linearGradient>



            <mask id="horizontalFade">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#fadeGradient)"
              />
            </mask>

          </defs>

          {/* Grid + Y labels */}
          {ticks.map((t, i) => {
            const y = padding.top + chartH - (t / domainMax) * chartH;
            return (
              <g key={i}>
                <line
                  x1={padding.left - 6}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#f3f4f6"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="tick-label"
                >
                  {t.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaPath} fill="url(#areaGradient)" mask="url(#horizontalFade)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            mask="url(#horizontalFade)"
          />


          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4.5}
              fill="#fff"
              stroke="#4C6EF5"
              strokeWidth="1.75"
              mask="url(#horizontalFade)"
              className="line-point"
              onMouseEnter={(e) => {
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  value: p.value,
                  label: p.label,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}



          {/* X labels */}
          {currentSeries.data.map((d, i) => (
            <text
              key={d.name}
              x={getX(i)}
              y={padding.top + chartH + 30}
              textAnchor="middle"
              className="x-label"
            >
              {d.name}
            </text>
          ))}

        </svg>

        {tooltip && (
          <div
            className="chart-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
          >
            <div className="tt-label">{tooltip.label}</div>
            <div className="tt-value">
              ₹{tooltip.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

