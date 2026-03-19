import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SavingsPage.css";
import { supabase } from "../../../lib/supabaseClient";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet02Icon,
  MoneyBag02Icon,
  SparklesIcon,
  RupeeShieldIcon,
} from "@hugeicons/core-free-icons";
import {
  deriveSavingsState,
  formatMonthKey,
  getDotCount,
  getDotTone,
  getSavingsRate,
  normalizeSavingsItems,
} from "./selectors/savingsSelectors";

const currency = (val) => `₹${Math.round(val).toLocaleString("en-IN")}`;

const getCurrentMonthKey = () => formatMonthKey(new Date());
const TREND_MONTHS = 6;

const shiftMonthKey = (monthKey, delta) => {
  const date = getDateFromMonthKey(monthKey);
  if (!date) return getCurrentMonthKey();

  const shifted = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  return formatMonthKey(shifted);
};

const getDateFromMonthKey = (key) => {
  if (!key) return null;

  if (typeof key === "string") {
    const monthMatch = key.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (monthMatch) {
      const year = Number(monthMatch[1]);
      const monthIndex = Number(monthMatch[2]) - 1;
      return new Date(year, monthIndex, 1);
    }
  }

  const date = new Date(key);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toMonthKey = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const monthPart = value.slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(monthPart)) return `${monthPart}-01`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatMonthKey(date);
};

const formatSavingsValue = (value) => {
  if (value === null || value === undefined) return "—";
  return value >= 0 ? currency(value) : `−${currency(Math.abs(value))}`;
};

function DotScale({ filled, total = 5, tone = "neutral", ariaLabel, pattern }) {
  const dotPattern = Array.isArray(pattern)
    ? Array.from({ length: total }, (_, i) => Boolean(pattern[i]))
    : Array.from({ length: total }, (_, i) => i < Math.max(0, Math.min(total, filled)));

  return (
    <div className={`dot-scale ${tone}`} aria-label={ariaLabel}>
      {dotPattern.map((isOn, i) => (
        <span key={i} className={`dot ${isOn ? "on" : "off"}`} />
      ))}
    </div>
  );
}

export default function SavingsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [goalAmount, setGoalAmount] = useState("8000");
  const [monthlySavings, setMonthlySavings] = useState([]);
  const [savingsTargets, setSavingsTargets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef({ monthlySavings: null, savingsTargets: null });

  useEffect(() => {
    console.log("Savings page mounted");

    // If we already loaded data once, hydrate from cache and skip fetch
    if (cacheRef.current.monthlySavings && cacheRef.current.savingsTargets) {
      setMonthlySavings(cacheRef.current.monthlySavings);
      setSavingsTargets(cacheRef.current.savingsTargets);
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    const loadData = async () => {
      setIsLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        console.error("No authenticated user for savings fetch", { userError, userData });
        if (active) {
          setMonthlySavings([]);
          setSavingsTargets({});
          setIsLoading(false);
        }
        return;
      }
      const userId = userData.user.id;
      const expenseWindowStart = new Date();
      expenseWindowStart.setDate(1);
      expenseWindowStart.setMonth(expenseWindowStart.getMonth() - 11);
      const expenseWindowStartStr = expenseWindowStart.toISOString().split("T")[0];

      const fetchExpensesForWindow = async () => {
        const pageSize = 1000;
        const rows = [];
        let from = 0;

        while (true) {
          const { data, error } = await supabase
            .from("expenses")
            .select("spent_at,amount")
            .eq("user_id", userId)
            .gte("spent_at", expenseWindowStartStr)
            .order("spent_at", { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) {
            return { data: null, error };
          }

          if (!Array.isArray(data) || data.length === 0) {
            break;
          }

          rows.push(...data);

          if (data.length < pageSize) {
            break;
          }

          from += pageSize;
        }

        return { data: rows, error: null };
      };

      const [
        { data: monthlySavingsData, error: monthlySavingsError },
        { data: targetsData, error: targetsError },
        { data: expensesData, error: expensesError },
      ] = await Promise.all([
        supabase
          .from("monthly_savings")
          .select("month,total_income,total_expense")
          .eq("user_id", userId)
          .order("month", { ascending: false })
          .limit(12),
        supabase
          .from("savings_targets")
          .select("month,target_amount")
          .eq("user_id", userId)
          .order("month", { ascending: false })
          .limit(12),
        fetchExpensesForWindow(),
      ]);

      if (monthlySavingsError) console.error("monthly_savings fetch error", monthlySavingsError);
      if (targetsError) console.error("savings_targets fetch error", targetsError);
      if (expensesError) console.error("expenses fetch error", expensesError);

      const targetMap = Array.isArray(targetsData)
        ? targetsData.reduce((acc, row) => {
          acc[row.month] = row.target_amount;
          return acc;
        }, {})
        : {};

      const expenseTotalsByMonth = Array.isArray(expensesData)
        ? expensesData.reduce((acc, row) => {
          const monthKey = toMonthKey(row.spent_at);
          if (!monthKey) return acc;
          acc[monthKey] = (acc[monthKey] || 0) + (Number(row.amount) || 0);
          return acc;
        }, {})
        : {};

      const mergedMonthlyMap = {};

      if (Array.isArray(monthlySavingsData)) {
        monthlySavingsData.forEach((row) => {
          const monthKey = row?.month;
          if (!monthKey) return;

          mergedMonthlyMap[monthKey] = {
            month: monthKey,
            income: Number(row.total_income) || 0,
            // Prefer live sum from expenses table when available.
            expenses: Number(
              Object.prototype.hasOwnProperty.call(expenseTotalsByMonth, monthKey)
                ? expenseTotalsByMonth[monthKey]
                : row.total_expense,
            ) || 0,
          };
        });
      }

      Object.entries(expenseTotalsByMonth).forEach(([monthKey, expenseTotal]) => {
        if (!mergedMonthlyMap[monthKey]) {
          mergedMonthlyMap[monthKey] = {
            month: monthKey,
            income: 0,
            expenses: Number(expenseTotal) || 0,
          };
        }
      });

      const normalizedSavings = normalizeSavingsItems(
        Object.values(mergedMonthlyMap),
      );

      if (active) {
        setMonthlySavings(normalizedSavings);
        setSavingsTargets(targetMap);

        cacheRef.current = {
          monthlySavings: normalizedSavings,
          savingsTargets: targetMap,
        };

        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const savingsState = useMemo(
    () => deriveSavingsState(monthlySavings, savingsTargets, selectedMonth),
    [monthlySavings, savingsTargets, selectedMonth],
  );

  const savingsRateSeries = useMemo(
    () => monthlySavings.map((item) => getSavingsRate(item)).filter((value) => Number.isFinite(value)),
    [monthlySavings],
  );

  const previousSixMonthsSavings = useMemo(() => {
    if (!Array.isArray(monthlySavings) || monthlySavings.length === 0) return [];

    const currentMonthKey = getCurrentMonthKey();
    return monthlySavings
      .filter((item) => item?.month && item.month < currentMonthKey)
      .slice(0, 6)
      .map((item) => ({
        month: item.month,
        income: Number(item.income) || 0,
        expenses: Number(item.expenses) || 0,
        savings: Number(item.savings ?? item.income - item.expenses) || 0,
      }));
  }, [monthlySavings]);

  const previousSixMonthsPattern = useMemo(
    () => previousSixMonthsSavings.map((item) => item.savings > 0),
    [previousSixMonthsSavings],
  );

  const savedMonthsCount = useMemo(
    () => previousSixMonthsPattern.filter(Boolean).length,
    [previousSixMonthsPattern],
  );

  const monthlyTrendDots = useMemo(() => {
    if (!Array.isArray(previousSixMonthsSavings) || previousSixMonthsSavings.length === 0) return [];

    // Oldest month at left, latest month at right.
    const analyzedMonths = previousSixMonthsSavings.slice(0, TREND_MONTHS).reverse();

    return analyzedMonths.map((item) => {
      const income = Number(item.income) || 0;
      const expenses = Number(item.expenses) || 0;

      let savingsRatePercent = 0;
      if (income > 0) {
        savingsRatePercent = ((income - expenses) / income) * 100;
      } else if (expenses > 0) {
        savingsRatePercent = -100;
      }

      const roundedRate = Math.round(savingsRatePercent);

      let tone = "trend-grey";
      if (savingsRatePercent > 50) {
        tone = "trend-green";
      } else if (savingsRatePercent >= 20) {
        tone = "trend-yellow";
      } else if (savingsRatePercent < 0) {
        tone = "trend-red";
      }

      const monthDate = getDateFromMonthKey(item.month);
      const monthLabel = monthDate
        ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(monthDate)
        : "Unknown month";

      return {
        month: item.month,
        tone,
        tooltip: `${monthLabel} — ${roundedRate}%`,
      };
    });
  }, [previousSixMonthsSavings]);

  const { summary, targetAmount, incomeExpense, forecast, bestMonth, lowMonth, consistency, edgeStates } = savingsState;

  const currentMonthKey = getCurrentMonthKey();
  const minMonthKey = useMemo(() => shiftMonthKey(currentMonthKey, -11), [currentMonthKey]);
  const canGoPreviousMonth = selectedMonth > minMonthKey;
  const canGoNextMonth = selectedMonth < currentMonthKey;

  const formatMonthLabel = (key) => {
    if (!key) return "—";
    const date = getDateFromMonthKey(key);
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  };

  const formatShortMonthLabel = (key) => {
    if (!key) return "—";
    const date = getDateFromMonthKey(key);
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
  };

  const selectedMonthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);

  const formatHistorySavingsValue = (value) => {
    if (value === null || value === undefined) return "—";
    const rounded = Math.round(Number(value) || 0);
    const amount = `₹${Math.abs(rounded).toLocaleString("en-IN")}`;
    return rounded < 0 ? `-${amount}` : amount;
  };

  const renderSkeletonCard = (lines = 3) => (
    <div className="summary-card skeleton-card">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="skeleton-line" />
      ))}
      <div className="skeleton-dots">
        {Array.from({ length: 5 }).map((_, idx) => (
          <span key={idx} className="skeleton-dot" />
        ))}
      </div>
    </div>
  );

  const handleOpenGoalModal = () => {
    console.log("SET_GOAL_BUTTON_CLICK");
    setGoalAmount((targetAmount ?? 0).toString());
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    console.log("SAVE_GOAL_HANDLER_START", { selectedMonth, goalAmount });

    const parsed = Number(goalAmount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      console.warn("Invalid goal amount", goalAmount);
      return;
    }

    if (!supabase || typeof supabase.from !== "function") {
      console.error("Supabase client missing or not initialized");
      return;
    }

    console.log("SUPABASE_CLIENT_OK", supabase);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      console.error("No authenticated user for goal save", { userError, userData });
      return;
    }
    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("savings_targets")
      .upsert({ user_id: userId, month: selectedMonth, target_amount: parsed }, { onConflict: "user_id,month" })
      .select("month, target_amount")
      .maybeSingle();

    console.log("SAVE_GOAL_RESULT", { data, error });

    if (error) return;

    setSavingsTargets((prev) => ({ ...prev, [selectedMonth]: parsed }));
    setGoalModalOpen(false);
  };

  return (
    <div className="savings-page">
      <header className="savings-head">
        <div>
          <h1 className="savings-title">Savings</h1>
          <p className="savings-sub">Understand how much you save or overspend each month.</p>
        </div>
      </header>

      <div className="summary-top-row">
        <div className="savings-filter">
          <div
            className="month-picker"
            role="group"
            aria-label="Select savings month"
          >
            <button
              type="button"
              className="month-picker-nav"
              onClick={() => setSelectedMonth((prev) => shiftMonthKey(prev, -1))}
              disabled={!canGoPreviousMonth}
              aria-label="Previous month"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <div className="month-picker-label" aria-live="polite">
              {selectedMonthLabel}
            </div>
            <button
              type="button"
              className="month-picker-nav"
              onClick={() => setSelectedMonth((prev) => shiftMonthKey(prev, 1))}
              disabled={!canGoNextMonth}
              aria-label="Next month"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <div className="summary-actions">
          <button
            className="ghost-link"
            type="button"
            onClick={handleOpenGoalModal}
          >
            Set saving goal
          </button>
        </div>
      </div>

      {!isLoading && (
        (() => {
          const messages = [];
          if (edgeStates.empty) {
            messages.push("No savings data yet. Add income and expenses to start tracking.");
          } else {
            if (edgeStates.incomeNoExpense) {
              messages.push("Income recorded but no expenses yet. Add expenses to see net savings.");
            }
            if (edgeStates.expenseNoIncome) {
              messages.push("Expenses recorded but no income yet. Savings will stay negative until income is added.");
            }
            if (edgeStates.singleMonthHistory) {
              messages.push("Only one month of history. Forecasts and consistency will stabilize after more months.");
            }
          }

          if (!messages.length) return null;
          return (
            <div className="savings-banner-stack">
              {messages.map((msg, idx) => (
                <div key={idx} className="savings-banner">{msg}</div>
              ))}
            </div>
          );
        })()
      )}

      {isLoading ? (
        <section className="summary-strip">
          {renderSkeletonCard(3)}
          {renderSkeletonCard(2)}
          {renderSkeletonCard(2)}
          {renderSkeletonCard(2)}
        </section>
      ) : (
        <section className="summary-strip">
          <div className="summary-card summary-card-positive">
            <div className="card-head">
              <span className="card-icon" aria-hidden="true">
                <HugeiconsIcon icon={MoneyBag02Icon} size={22} strokeWidth={1.9} color="currentColor" />
              </span>
              <p className="summary-label">{summary.label}</p>
            </div>
            <p className={`summary-value ${summary.tone}`}>
              {summary.hasData ? formatSavingsValue(summary.savings) : "—"}
            </p>
            <div className="mini-progress" aria-label="Savings progress">
              <div
                className="mini-progress-fill"
                style={{ width: `${summary.progressPercent}%` }}
              />
            </div>
            <div className="mini-progress-row">
              <span className="mini-progress-text">
                Target {summary.savingsTarget !== null && summary.savingsTarget !== undefined ? currency(summary.savingsTarget) : "Set a goal"}
              </span>
              <span className="mini-progress-text">
                {summary.lastMonthSavings !== null && summary.lastMonthSavings !== undefined
                  ? `Last month ${formatSavingsValue(summary.lastMonthSavings)}`
                  : "No previous month"}
              </span>
            </div>
          </div>
          <div className="summary-card summary-card-accent">
            <div className="card-head">
              <span className="card-icon" aria-hidden="true">
                <HugeiconsIcon icon={SparklesIcon} size={22} strokeWidth={1.9} color="currentColor" />
              </span>
              <p className="summary-label">Savings rate</p>
            </div>
            <p className="summary-value neutral">{Math.round(summary.savingsRate * 100)}%</p>
            <DotScale
              filled={getDotCount(summary.savingsRate, savingsRateSeries)}
              ariaLabel="Savings rate indicator"
              tone={getDotTone(summary.savings)}
            />
          </div>
          <div className="summary-card summary-card-info">
            <div className="card-head">
              <span className="card-icon" aria-hidden="true">
                <HugeiconsIcon icon={Wallet02Icon} size={22} strokeWidth={1.9} color="currentColor" />
              </span>
              <p className="summary-label">Income vs expense</p>
            </div>
            <p className="summary-value neutral">
              {summary.hasData
                ? `${currency(incomeExpense.income)} vs ${currency(incomeExpense.expenses)}`
                : "—"}
            </p>
            {/* <div className="thin-divider" /> */}
            <p className="subtext">
              {summary.hasData
                ? summary.savings >= 0
                  ? "Expenses are under income"
                  : "Expenses slightly exceeded income"
                : "Data pending"}
            </p>
          </div>
          <div className="summary-card summary-card-positive">
            <div className="card-head">
              <span className="card-icon" aria-hidden="true">
                <HugeiconsIcon icon={SparklesIcon} size={22} strokeWidth={1.9} color="currentColor" />
              </span>
              <p className="summary-label">Savings consistency</p>
            </div>
            <DotScale
              total={Math.max(previousSixMonthsPattern.length, 6)}
              pattern={previousSixMonthsPattern.length ? previousSixMonthsPattern : [false, false, false, false, false, false]}
              tone={consistency.window === 0 ? "neutral" : "positive"}
              ariaLabel="Savings consistency indicator"
            />
            <p className="subtext">
              {previousSixMonthsPattern.length === 0
                ? "Not enough history yet."
                : `Saved in ${savedMonthsCount} of last 6 months`}
            </p>
            <button
              className="link-quiet history-trigger"
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              disabled={previousSixMonthsSavings.length === 0}
            >
              View last 6 months savings
            </button>
          </div>
        </section>
      )}

      <p className="legend-text">Dots indicate savings strength for the selected month.</p>

      <section className="plain-grid">
        <div className="plain-card plain-card-info">
          <div className="section-head">
            <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={Wallet02Icon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
            <h3>This month</h3>
          </div>
          <div className="plain-lines">
            <div className="line with-divider"><span>Income</span><span>{summary.hasData ? currency(incomeExpense.income) : "—"}</span></div>
            <div className="line with-divider"><span>Expenses</span><span>{summary.hasData ? currency(incomeExpense.expenses) : "—"}</span></div>
            <div className="line highlight"><span className="savings-label"><span className="dot tiny-dot" />Savings</span><span>{summary.hasData ? formatSavingsValue(summary.savings) : "—"}</span></div>
          </div>
          <p className="micro-subtext">Savings rate this month: {Math.round(summary.savingsRate * 100)}% of income</p>
          <p className="micro-subtext">Average monthly savings: {forecast.hasData ? formatSavingsValue(forecast.average) : "Not enough data"}</p>
        </div>

        <div className="plain-card plain-card-accent">
          <div className="section-head">
            <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={SparklesIcon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
            <h3>Forecast</h3>
          </div>
          <div className="plain-lines">
            <div className="line with-divider">
              <span>Projected savings (next 3 months)</span>
              <span>{forecast.hasData ? formatSavingsValue(forecast.projected) : "Not enough data"}</span>
            </div>
            <div className="line with-divider">
              <span>On-track status</span>
              <span className={`status-pill ${targetAmount === null ? "negative" : summary.hasData && summary.savings >= targetAmount ? "positive" : "negative"}`}>
                {targetAmount === null
                  ? "Set a goal"
                  : summary.hasData
                    ? summary.savings >= targetAmount
                      ? "On track"
                      : "Slightly off-track"
                    : "Target set"}
              </span>
            </div>
            <div className="line with-divider">
              <span>Current saving pace</span>
              <span>{summary.hasData ? `${formatSavingsValue(summary.savings)}/mo` : "Not enough data"}</span>
            </div>
            <div className="line">
              <span>Best vs likely (recent variation)</span>
              <span>
                {forecast.hasData
                  ? `${formatSavingsValue(forecast.best)} · ${formatSavingsValue(forecast.likely)}`
                  : "Not enough data"}
              </span>
            </div>
          </div>
          <p className="micro-subtext">Assumes recent months repeat; best/likely use small variance.</p>
        </div>
      </section>

      <section className="paired-cards">
        <div className="plain-card plain-card-positive">
          <div className="section-head compact">
             <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={MoneyBag02Icon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
            <p className="badge">High savings month</p>
           
          </div>
          <h4 className="month-title">{bestMonth ? formatMonthLabel(bestMonth.month) : "Not enough data"}</h4>
          <p className="month-amount positive">
            {bestMonth ? `Saved ${currency(bestMonth.savings)}` : "—"}
          </p>
          <p className="micro-label">Best month in range</p>
          <div className="dot-scale trend-scale" aria-label="Monthly savings trend">
            {monthlyTrendDots.map((dot) => (
              <span
                key={`best-${dot.month}`}
                className="trend-dot-wrap"
                onMouseEnter={(e) => {
                  const wrap = e.currentTarget;
                  const label = wrap.querySelector(".trend-dot-label");
                  if (!label) return;
                  wrap.removeAttribute("data-align");
                  const rect = label.getBoundingClientRect();
                  if (rect.left < 4) {
                    wrap.setAttribute("data-align", "left");
                  } else if (rect.right > window.innerWidth - 4) {
                    wrap.setAttribute("data-align", "right");
                  }
                }}
              >
                <span className={`dot trend-dot ${dot.tone}`} aria-label={dot.tooltip} />
                <span className="trend-dot-label">{dot.tooltip}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="plain-card plain-card-negative">
          <div className="section-head compact">
             <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={RupeeShieldIcon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
            <p className="badge badge-negative">Low savings month</p>
           
          </div>
          <h4 className="month-title">{lowMonth ? formatMonthLabel(lowMonth.month) : "Not enough data"}</h4>
          <p className="month-amount negative">
            {lowMonth ? `Overspent ${currency(Math.abs(lowMonth.savings))}` : "—"}
          </p>
          <p className="micro-label">Lowest month in range</p>
          <div className="dot-scale trend-scale" aria-label="Monthly savings trend">
            {monthlyTrendDots.map((dot) => (
              <span
                key={`low-${dot.month}`}
                className="trend-dot-wrap"
                onMouseEnter={(e) => {
                  const wrap = e.currentTarget;
                  const label = wrap.querySelector(".trend-dot-label");
                  if (!label) return;
                  wrap.removeAttribute("data-align");
                  const rect = label.getBoundingClientRect();
                  if (rect.left < 4) {
                    wrap.setAttribute("data-align", "left");
                  } else if (rect.right > window.innerWidth - 4) {
                    wrap.setAttribute("data-align", "right");
                  }
                }}
              >
                <span className={`dot trend-dot ${dot.tone}`} aria-label={dot.tooltip} />
                <span className="trend-dot-label">{dot.tooltip}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {goalModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Set savings goal">
          <div className="modal-card">
            <h3 className="modal-title">Set savings goal</h3>
            <p className="modal-sub">Choose a monthly savings target.</p>
            <label className="modal-label" htmlFor="goal-input">Goal amount</label>
            <input
              id="goal-input"
              className="modal-input"
              type="number"
              min="0"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
            <div className="modal-actions">
              <button className="ghost-link" type="button" onClick={() => setGoalModalOpen(false)}>
                Cancel
              </button>
              <button
                className="solid-btn"
                type="button"
                onClick={handleSaveGoal}
              >
                Save goal
              </button>
            </div>
          </div>
        </div>
      )}

      {historyModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Last 6 months savings">
          <div className="modal-card">
            <h3 className="modal-title">Last 6 months savings</h3>
            <p className="modal-sub">Month-wise net savings from your finance records.</p>

            <div className="history-list">
              {previousSixMonthsSavings.length === 0 ? (
                <p className="subtext">Not enough history.</p>
              ) : (
                previousSixMonthsSavings.map((item) => (
                  <div key={item.month} className="history-row">
                    <span>{formatShortMonthLabel(item.month)}</span>
                    <span className={item.savings >= 0 ? "positive-value" : "negative-value"}>
                      {formatHistorySavingsValue(item.savings)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="ghost-link" type="button" onClick={() => setHistoryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
