import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./MonthlyExpensesChart.css";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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

const RANGE_CONFIG = {
  "7d": { type: "daily", days: 7 },
  "30d": { type: "weekly", days: 30 },
  "6m": { type: "monthly", months: 6 },
  "1y": { type: "monthly", months: 12 },
};

const startOfMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildBaseBuckets = (rangeKey) => {
  const config = RANGE_CONFIG[rangeKey] || RANGE_CONFIG["6m"];
  const today = new Date();

  if (config.type === "daily") {
    const days = config.days || 7;
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const name = d.toLocaleDateString("en-US", { weekday: "short" });
      return { key, name, tooltip: name };
    });
    return buckets;
  }

  if (config.type === "weekly") {
    // 4 rolling buckets, 0-6, 7-13, 14-20, 21-29 days ago
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const tooltips = ["Days 21-29 ago", "Days 14-20 ago", "Days 7-13 ago", "Last 7 days"];
    return labels.map((name, idx) => ({ key: `w${idx + 1}`, name, tooltip: tooltips[idx] }));
  }

  // monthly buckets (default)
  const months = config.months || 6;
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
    return {
      key: startOfMonthKey(date),
      name: date.toLocaleString("en-US", { month: "short" }),
      tooltip: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
    };
  });
};

export default function MonthlyExpensesChart() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(900);
  const height = 320;
  const [mode, setMode] = useState("expenses");
  const [range, setRange] = useState("6m");
  const [tooltip, setTooltip] = useState(null);
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const navigate = useNavigate();
  const baseBuckets = useMemo(() => buildBaseBuckets(range), [range]);
  const [series, setSeries] = useState(() => {
    const zeroes = baseBuckets.map((b) => ({ ...b, value: 0 }));
    return { expenses: zeroes, savings: zeroes };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const zeroes = baseBuckets.map((b) => ({ ...b, value: 0 }));
    setSeries({ expenses: zeroes, savings: zeroes });
  }, [baseBuckets]);

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

  const load = useCallback(async () => {
    const zeroes = baseBuckets.map((b) => ({ ...b, value: 0 }));

    if (!userId) {
      setSeries({ expenses: zeroes, savings: zeroes });
      return;
    }

    const config = RANGE_CONFIG[range] || RANGE_CONFIG["6m"];

    // compute fromDate based on range type using Date math (no string concatenation)
    let fromDate;
    const today = new Date();
    if (config.type === "daily") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      fromDate = start.toISOString().slice(0, 10);
    } else if (config.type === "weekly") {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      fromDate = start.toISOString().slice(0, 10);
    } else {
      const months = config.months || 6;
      const start = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);
      fromDate = start.toISOString().slice(0, 10);
    }

    if (!fromDate) {
      setSeries({ expenses: zeroes, savings: zeroes });
      return;
    }

    setLoading(true);
    try {
      const [{ data: expenseRows, error: expenseError }, { data: incomeRows, error: incomeError }] = await Promise.all([
        supabase
          .from("expenses")
          .select("amount, spent_at")
          .eq("user_id", userId)
          .gte("spent_at", fromDate),
        supabase
          .from("transactions")
          .select("amount, occurred_on")
          .eq("user_id", userId)
          .eq("type", "income")
          .gte("occurred_on", fromDate),
      ]);

      if (expenseError) throw expenseError;
      if (incomeError) throw incomeError;

      const expenseMap = (expenseRows || []).reduce((acc, row) => {
        const spent = row.spent_at || "";
        if (config.type === "daily") {
          const key = spent.slice(0, 10);
          if (!key) return acc;
          acc[key] = (acc[key] || 0) + Number(row.amount || 0);
          return acc;
        }
        if (config.type === "weekly") {
          const daysAgo = Math.floor((new Date() - new Date(spent)) / 86400000);
          if (daysAgo < 0 || daysAgo > 29) return acc;
          const bucketKey =
            daysAgo <= 6 ? "w4" :
            daysAgo <= 13 ? "w3" :
            daysAgo <= 20 ? "w2" : "w1";
          acc[bucketKey] = (acc[bucketKey] || 0) + Number(row.amount || 0);
          return acc;
        }
        const key = spent.slice(0, 7);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + Number(row.amount || 0);
        return acc;
      }, {});

      const incomeMap = (incomeRows || []).reduce((acc, row) => {
        const occurred = row.occurred_on || "";
        if (config.type === "daily") {
          const key = occurred.slice(0, 10);
          if (!key) return acc;
          acc[key] = (acc[key] || 0) + Number(row.amount || 0);
          return acc;
        }
        if (config.type === "weekly") {
          const daysAgo = Math.floor((new Date() - new Date(occurred)) / 86400000);
          if (daysAgo < 0 || daysAgo > 29) return acc;
          const bucketKey =
            daysAgo <= 6 ? "w4" :
            daysAgo <= 13 ? "w3" :
            daysAgo <= 20 ? "w2" : "w1";
          acc[bucketKey] = (acc[bucketKey] || 0) + Number(row.amount || 0);
          return acc;
        }
        const key = occurred.slice(0, 7);
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + Number(row.amount || 0);
        return acc;
      }, {});

      const alignedExpenses = baseBuckets.map((bucket) => ({
        ...bucket,
        value: Number(expenseMap[bucket.key] || 0),
      }));

      const alignedIncome = baseBuckets.map((bucket) => ({
        ...bucket,
        value: Number(incomeMap[bucket.key] || 0),
      }));

      const alignedSavings = baseBuckets.map((bucket, idx) => ({
        ...bucket,
        value: Math.max(0, Number((alignedIncome[idx]?.value || 0) - (alignedExpenses[idx]?.value || 0))),
      }));

      setSeries({ expenses: alignedExpenses, savings: alignedSavings });
    } catch (err) {
      setSeries({ expenses: zeroes, savings: zeroes });
    } finally {
      setLoading(false);
    }
  }, [userId, baseBuckets, range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return undefined;

    const channel = supabase
      .channel(`expenses-monthly-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, load]);

  const padding = { top: 18, right: 18, bottom: 46, left: 50 };
  const chartW = Math.max(0, width - padding.left - padding.right);
  const chartH = Math.max(0, height - padding.top - padding.bottom);

  const mergedSeries = useMemo(
    () => ({
      expenses: { ...SERIES.expenses, data: series.expenses },
      savings: { ...SERIES.savings, data: series.savings },
    }),
    [series]
  );

  const currentSeries = mergedSeries[mode];
  const seriesData = currentSeries.data || [];
  const values = seriesData.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const step = 5000;
  let domainMax;

  if (mode === "savings") {
    domainMax = maxVal * 1.25;
    domainMax = Math.max(domainMax, 1000);
  } else {
    domainMax = Math.ceil(maxVal / step) * step;
    domainMax = Math.max(domainMax, maxVal * 1.15);
  }

  if (!Number.isFinite(domainMax) || domainMax <= 0) {
    domainMax = step;
  }
  const rightInset = 32; // subtle, not visible as padding


  const ticks = Array.from({ length: 7 }, (_, i) =>
    Math.round((i * domainMax) / 6)
  );

  const getX = (i) =>
    padding.left +
    ((chartW - rightInset) / Math.max(1, seriesData.length - 1)) * i;


  // --- Line points ---
  const points = seriesData.map((d, i) => {
    const x = getX(i);
    const y =
      padding.top +
      chartH -
      (d.value / domainMax) * chartH;

    return { x, y, value: d.value, label: d.name, tooltip: d.tooltip };
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
    (points.length
      ? ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
      : "");

  return (
    <div className="monthly-expenses-card" ref={containerRef}>
      <div className="monthly-expenses-header">
        <h3>{currentSeries.label}</h3>
        <div className="monthly-expenses-info">
          <button className="bills-manage" onClick={() => navigate("/expenses")}>Manage →</button>
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
          <select
            className="monthly-expenses-dropdown"
            aria-label="range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="chart-wrap" style={{ height }}>
        {loading && <div className="chart-loading">Refreshing…</div>}
        <svg width={width} height={height} className="expenses-svg">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3CA8D6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#244809" stopOpacity="0" />
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
                  detail: p.tooltip,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}



          {/* X labels */}
          {seriesData.map((d, i) => (
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
            {tooltip.detail && <div className="tt-sub">{tooltip.detail}</div>}
            <div className="tt-value">
              ₹{tooltip.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

