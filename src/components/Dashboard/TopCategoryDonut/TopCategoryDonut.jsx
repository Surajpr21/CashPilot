import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./TopCategoryDonut.css";
import { useAuth } from "../../../contexts/AuthContext";
import { getTopCategories } from "../../../services/expenses.service";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const GRADIENTS = [
  { from: "#CDE7A2", to: "#90D087" },
  { from: "#FFE6A8", to: "#F4C86A" },
  { from: "#B7EFE5", to: "#6ECFBC" },
  { from: "#BEE6FF", to: "#7CB8E8" },
  { from: "#C9C8FF", to: "#8EA2F6" },
];

const CATEGORY_GRADIENTS = {
  utilities: { from: "#FDE68A", to: "#F59E0B" },
  transportation: { from: "#A5B4FC", to: "#6366F1" },
};

const RANGE_DAYS = {
  "7d": 7,
  "30d": 30,
  "6m": 180,
  "1y": 365,
};

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

const lighten = (hex, amount = 0.18) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
  const b = Math.min(255, (num & 0xff) + 255 * amount);
  return `rgb(${r}, ${g}, ${b})`;
};

const TopCategoryDonut = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [range, setRange] = useState("6m");
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!userId) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const days = RANGE_DAYS[range] || 30;
      const rows = await getTopCategories({ userId, days });
      setData((rows || []).slice(0, 8));
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return undefined;

    const channel = supabase
      .channel(`top-category-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, load]);

  const topCategory = useMemo(() => {
    if (!data.length) return { name: "–", value: 0 };
    return data.reduce((max, item) => (item.value > max.value ? item : max));
  }, [data]);

  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const pieData = data.length ? data : [{ name: "No data", value: 0 }];

  const gradientIdFor = (name, index) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("util")) return "donut-grad-utilities";
    if (lower.includes("transport")) return "donut-grad-transport";
    return `donut-grad-${index % GRADIENTS.length}`;
  };

  return (
    <div className="donut-card">
      <div className="donut-header">
        <h3 className="donut-title">Top category</h3>
        <button className="bills-manage" onClick={() => navigate("/expenses")}>Manage →</button>
        <select
          className="donut-dropdown"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="6m">Last 6 months</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="donut-wrapper">
        <ResponsiveContainer width={260} height={260}>
          <PieChart>
            {loading && <text x="50%" y="50%" textAnchor="middle">Loading…</text>}

            <defs>
              {GRADIENTS.map((g, i) => (
                <linearGradient key={i} id={`donut-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              ))}

              {GRADIENTS.map((g, i) => (
                <linearGradient key={`active-${i}`} id={`donut-grad-active-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(g.from)} />
                  <stop offset="100%" stopColor={lighten(g.to)} />
                </linearGradient>
              ))}

              <linearGradient id="donut-grad-utilities" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={CATEGORY_GRADIENTS.utilities.from} />
                <stop offset="100%" stopColor={CATEGORY_GRADIENTS.utilities.to} />
              </linearGradient>
              <linearGradient id="donut-grad-active-utilities" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={lighten(CATEGORY_GRADIENTS.utilities.from)} />
                <stop offset="100%" stopColor={lighten(CATEGORY_GRADIENTS.utilities.to)} />
              </linearGradient>

              <linearGradient id="donut-grad-transport" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={CATEGORY_GRADIENTS.transportation.from} />
                <stop offset="100%" stopColor={CATEGORY_GRADIENTS.transportation.to} />
              </linearGradient>
              <linearGradient id="donut-grad-active-transport" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={lighten(CATEGORY_GRADIENTS.transportation.from)} />
                <stop offset="100%" stopColor={lighten(CATEGORY_GRADIENTS.transportation.to)} />
              </linearGradient>
            </defs>

            <Pie
              data={pieData}
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
              {pieData.map((entry, i) => {
                const gradId = gradientIdFor(entry.name, i);
                const isActive = i === activeIndex;
                return (
                  <Cell
                    key={i}
                    fill={`url(#${isActive ? `${gradId.replace("donut-grad", "donut-grad-active")}` : gradId})`}
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
              formatter={(value, _, props) => [currencyFmt.format(value), props.payload.name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="donut-center">
          <div className="donut-center-amount">
            <UpArrowIcon className="donut-arrow-icon" />
            <span className="donut-value">{currencyFmt.format(Number(topCategory.value || 0))}</span>
          </div>

          <div className="donut-center-label" title={topCategory.name}>
            {topCategory.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCategoryDonut;
