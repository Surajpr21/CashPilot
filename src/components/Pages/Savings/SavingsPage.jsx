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

const PERIOD_OPTIONS = [
  { value: "this-month", label: "This month" },
  { value: "previous", label: "Previous month" },
];

const currency = (val) => `₹${Math.round(val).toLocaleString("en-IN")}`;

const getCurrentMonthKey = () => formatMonthKey(new Date());

const formatSavingsValue = (value) => {
  if (value === null || value === undefined) return "—";
  return value >= 0 ? currency(value) : `−${currency(Math.abs(value))}`;
};

function DotScale({ filled, total = 5, tone = "neutral", ariaLabel }) {
  const safeFilled = Math.max(0, Math.min(total, filled));
  return (
    <div className={`dot-scale ${tone}`} aria-label={ariaLabel}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`dot ${i < safeFilled ? "on" : "off"}`} />
      ))}
    </div>
  );
}

export default function SavingsPage() {
  const [period, setPeriod] = useState("this-month");
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

      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
      const startStr = start.toISOString().split("T")[0];
      const endStr = new Date(end.getFullYear(), end.getMonth() + 1, 0).toISOString().split("T")[0];

      const [
        { data: monthlySavingsData, error: monthlySavingsError },
        { data: targetsData, error: targetsError },
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
      ]);

      if (monthlySavingsError) console.error("monthly_savings fetch error", monthlySavingsError);
      if (targetsError) console.error("savings_targets fetch error", targetsError);

      const targetMap = Array.isArray(targetsData)
        ? targetsData.reduce((acc, row) => {
            acc[row.month] = row.target_amount;
            return acc;
          }, {})
        : {};

      const normalizedSavings = normalizeSavingsItems(
        Array.isArray(monthlySavingsData)
          ? monthlySavingsData.map((row) => ({
              month: row.month,
              income: Number(row.total_income) || 0,
              expenses: Number(row.total_expense) || 0,
            }))
          : [],
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

  useEffect(() => {
    if (period === "this-month") {
      setSelectedMonth(getCurrentMonthKey());
    } else if (period === "previous") {
      const prev = new Date();
      prev.setMonth(prev.getMonth() - 1);
      setSelectedMonth(formatMonthKey(prev));
    }
  }, [period]);

  const savingsState = useMemo(
    () => deriveSavingsState(monthlySavings, savingsTargets, selectedMonth),
    [monthlySavings, savingsTargets, selectedMonth],
  );

  const savingsRateSeries = useMemo(
    () => monthlySavings.map((item) => getSavingsRate(item)).filter((value) => Number.isFinite(value)),
    [monthlySavings],
  );

  const consistencySeries = useMemo(() => {
    if (!Array.isArray(monthlySavings) || monthlySavings.length === 0) return [];

    return monthlySavings.map((_, index, list) => {
      const window = list.slice(index);
      if (window.length === 0) return 0;

      const savedMonths = window.filter((item) => (item.savings ?? item.income - item.expenses) > 0).length;
      return savedMonths / window.length;
    });
  }, [monthlySavings]);

  const previousSixMonthsSavings = useMemo(() => {
    if (!Array.isArray(monthlySavings) || monthlySavings.length === 0) return [];

    const currentMonthKey = getCurrentMonthKey();
    return monthlySavings
      .filter((item) => item?.month && item.month < currentMonthKey)
      .slice(0, 6)
      .map((item) => ({
        month: item.month,
        savings: Number(item.savings ?? item.income - item.expenses) || 0,
      }));
  }, [monthlySavings]);

  const { summary, targetAmount, incomeExpense, forecast, bestMonth, lowMonth, consistency, edgeStates } = savingsState;

  const formatMonthLabel = (key) => {
    if (!key) return "—";
    const date = new Date(key);
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
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
          <select
            id="period-select"
            className="filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
            <div className="thin-divider" />
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
              filled={getDotCount(consistency.ratio, consistencySeries)}
              tone={consistency.window === 0 ? "neutral" : "positive"}
              ariaLabel="Savings consistency indicator"
            />
            <p className="subtext">
              {consistency.window === 0
                ? "Not enough history yet."
                : `You saved money in ${consistency.savedMonths} of the last ${consistency.window} months.`}
            </p>
            <button
              className="link-quiet history-trigger"
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              disabled={previousSixMonthsSavings.length === 0}
            >
              View previous 6 months savings
            </button>
          </div>
        </section>
      )}

      <p className="legend-text">Dots indicate savings strength for the selected period.</p>

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
          <p className="micro-subtext">Typical month: {forecast.hasData ? formatSavingsValue(forecast.average) : "Not enough data"}</p>
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
            <p className="badge">High savings month</p>
            <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={MoneyBag02Icon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
          </div>
          <h4 className="month-title">{bestMonth ? formatMonthLabel(bestMonth.month) : "Not enough data"}</h4>
          <p className="month-amount positive">
            {bestMonth ? `Saved ${currency(bestMonth.savings)}` : "—"}
          </p>
          <p className="micro-label">Best month in range</p>
          <DotScale
            filled={bestMonth ? getDotCount(getSavingsRate(bestMonth), savingsRateSeries) : 1}
            tone={bestMonth ? getDotTone(bestMonth.savings) : "neutral"}
            ariaLabel="Best month strength"
          />
        </div>
        <div className="plain-card plain-card-negative">
          <div className="section-head compact">
            <p className="badge badge-negative">Low savings month</p>
            <span className="card-icon" aria-hidden="true">
              <HugeiconsIcon icon={RupeeShieldIcon} size={22} strokeWidth={1.9} color="currentColor" />
            </span>
          </div>
          <h4 className="month-title">{lowMonth ? formatMonthLabel(lowMonth.month) : "Not enough data"}</h4>
          <p className="month-amount negative">
            {lowMonth ? `Overspent ${currency(Math.abs(lowMonth.savings))}` : "—"}
          </p>
          <p className="micro-label">Lowest month in range</p>
          <DotScale
            filled={lowMonth ? getDotCount(getSavingsRate(lowMonth), savingsRateSeries) : 1}
            tone={lowMonth ? getDotTone(lowMonth.savings) : "neutral"}
            ariaLabel="Worst month strength"
          />
        </div>
      </section>

      <div className="inline-actions">
        <button className="link-quiet">View related expenses</button>
        <button className="link-quiet">Go to dashboard</button>
      </div>

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
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Previous 6 months savings">
          <div className="modal-card">
            <h3 className="modal-title">Previous 6 months savings</h3>
            <p className="modal-sub">Month-wise net savings from your finance records.</p>

            <div className="history-list">
              {previousSixMonthsSavings.length === 0 ? (
                <p className="subtext">Not enough history.</p>
              ) : (
                previousSixMonthsSavings.map((item) => (
                  <div key={item.month} className="history-row">
                    <span>{formatMonthLabel(item.month)}</span>
                    <span className={item.savings >= 0 ? "positive-value" : "negative-value"}>
                      {formatSavingsValue(item.savings)}
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
