import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { getUpcomingSubscriptions } from "../services/subscriptions.servies";
import { getInvestmentsTotal } from "../lib/api/assets.api";

const DashboardDataContext = createContext(null);

const RANGE_CONFIG = {
  "7d": { type: "daily", days: 7 },
  "30d": { type: "weekly", days: 30 },
  "6m": { type: "monthly", months: 6 },
  "1y": { type: "monthly", months: 12 },
};

const rangeDaysLookup = { "7d": 7, "30d": 30, "6m": 180, "1y": 365 };

function startOfMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildBaseBuckets(rangeKey, today = new Date()) {
  const config = RANGE_CONFIG[rangeKey] || RANGE_CONFIG["6m"];

  if (config.type === "daily") {
    const days = config.days || 7;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const name = d.toLocaleDateString("en-US", { weekday: "short" });
      return { key, name, tooltip: name };
    });
  }

  if (config.type === "weekly") {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const tooltips = ["Days 21-29 ago", "Days 14-20 ago", "Days 7-13 ago", "Last 7 days"];
    return labels.map((name, idx) => ({ key: `w${idx + 1}`, name, tooltip: tooltips[idx] }));
  }

  const months = config.months || 6;
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
    return {
      key: startOfMonthKey(date),
      name: date.toLocaleString("en-US", { month: "short" }),
      tooltip: date.toLocaleString("en-US", { month: "short", year: "numeric" }),
    };
  });
}

function bucketKeyForDate(dateStr, rangeKey) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const config = RANGE_CONFIG[rangeKey] || RANGE_CONFIG["6m"];

  if (config.type === "daily") {
    return dateStr.slice(0, 10);
  }

  if (config.type === "weekly") {
    const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (daysAgo < 0 || daysAgo > 29) return null;
    if (daysAgo <= 6) return "w4";
    if (daysAgo <= 13) return "w3";
    if (daysAgo <= 20) return "w2";
    return "w1";
  }

  return dateStr.slice(0, 7);
}

function sumBy(list, selector) {
  return (list || []).reduce((sum, item) => sum + Number(selector(item) || 0), 0);
}

function toDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinRange(dateValue, start, end) {
  const d = toDate(dateValue);
  if (!d) return false;
  return d >= start && d <= end;
}

export function DashboardDataProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.user?.id || null;

  const [state, setState] = useState({
    expenses: [],
    incomes: [],
    budgets: [],
    subscriptions: [],
    investmentsTotal: 0,
    allTimeIncome: 0,
    allTimeExpenses: 0,
    totalBalance: 0,
    savedThisMonth: 0,
    monthlySavingTotals: { income: 0, expense: 0 },
    openingBalance: 0,
    loading: false,
    error: null,
    lastLoaded: null,
  });

  const resetState = useCallback(() => {
    setState({
      expenses: [],
      incomes: [],
      budgets: [],
      subscriptions: [],
      investmentsTotal: 0,
      allTimeIncome: 0,
      allTimeExpenses: 0,
      totalBalance: 0,
      savedThisMonth: 0,
      monthlySavingTotals: { income: 0, expense: 0 },
      openingBalance: 0,
      loading: false,
      error: null,
      lastLoaded: null,
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!userId) {
      resetState();
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const today = new Date();
    const from = new Date(today);
    from.setFullYear(today.getFullYear() - 1);
    const fromStr = from.toISOString().slice(0, 10);
    const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthStart = monthStartDate.toISOString().slice(0, 10);
    const monthEnd = monthEndDate.toISOString().slice(0, 10);

    try {
      const [
        expensesRes,
        incomesRes,
        budgetsRes,
        subscriptionsRes,
        investmentsRes,
        financialRes,
        allIncomeRes,
        allExpensesRes,
        monthlySavingRes,
      ] = await Promise.all([
        supabase
          .from("expenses")
          .select("id, title, category, sub_category, amount, spent_at, payment_mode, user_id")
          .eq("user_id", userId)
          .gte("spent_at", fromStr),
        supabase
          .from("transactions")
          .select("id, amount, occurred_on, category, note, user_id, type")
          .eq("type", "income")
          .eq("user_id", userId)
          .gte("occurred_on", fromStr),
        supabase
          .from("budgets")
          .select("id, category, amount, month")
          .eq("user_id", userId)
          .gte("month", monthStart)
          .lte("month", monthEnd),
        getUpcomingSubscriptions(userId),
        getInvestmentsTotal(),
        supabase
          .from("financial_settings")
          .select("opening_balance")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("transactions")
          .select("amount")
          .eq("type", "income")
          .eq("user_id", userId),
        supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", userId),
        supabase
          .from("monthly_savings")
          .select("total_income, total_expense")
          .eq("user_id", userId)
          .eq("month", monthStart)
          .maybeSingle(),
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (incomesRes.error) throw incomesRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (financialRes.error && financialRes.error?.code !== "PGRST116") throw financialRes.error;
      if (allIncomeRes.error) throw allIncomeRes.error;
      if (allExpensesRes.error) throw allExpensesRes.error;
      if (monthlySavingRes.error && monthlySavingRes.error?.code !== "PGRST116") throw monthlySavingRes.error;

      const investmentsTotal = Number(investmentsRes?.total_invested || 0);
      const openingBalance = Number(financialRes.data?.opening_balance || 0);
      const allIncomeTotal = sumBy(allIncomeRes.data, (row) => row.amount);
      const allExpenseTotal = sumBy(allExpensesRes.data, (row) => row.amount);
      // Total balance excludes investments because they are tracked separately on the dashboard
      const totalBalance = openingBalance + allIncomeTotal - allExpenseTotal;

      const monthlyIncomeFromTable = Number(monthlySavingRes?.data?.total_income || 0);
      const monthlyExpenseFromTable = Number(monthlySavingRes?.data?.total_expense || 0);
      const hasMonthlySavingsRow = !monthlySavingRes?.error && !!monthlySavingRes?.data;

      const fallbackMonthlyIncome = hasMonthlySavingsRow
        ? 0
        : sumBy(incomesRes.data, (row) => (isWithinRange(row.occurred_on, monthStartDate, monthEndDate) ? row.amount : 0));
      const fallbackMonthlyExpense = hasMonthlySavingsRow
        ? 0
        : sumBy(expensesRes.data, (row) => (isWithinRange(row.spent_at, monthStartDate, monthEndDate) ? row.amount : 0));

      const monthIncome = hasMonthlySavingsRow ? monthlyIncomeFromTable : fallbackMonthlyIncome;
      const monthExpense = hasMonthlySavingsRow ? monthlyExpenseFromTable : fallbackMonthlyExpense;
      const savedThisMonth = monthIncome - monthExpense;

      setState({
        expenses: expensesRes.data || [],
        incomes: incomesRes.data || [],
        budgets: budgetsRes.data || [],
        subscriptions: subscriptionsRes || [],
        investmentsTotal,
        allTimeIncome: allIncomeTotal,
        allTimeExpenses: allExpenseTotal,
        totalBalance,
        savedThisMonth,
        monthlySavingTotals: { income: monthIncome, expense: monthExpense },
        openingBalance,
        loading: false,
        error: null,
        lastLoaded: Date.now(),
      });
    } catch (err) {
      console.error("Dashboard load failed", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Failed to load dashboard data",
        expenses: [],
        incomes: [],
        budgets: [],
        subscriptions: [],
        investmentsTotal: 0,
        allTimeIncome: 0,
        allTimeExpenses: 0,
        totalBalance: 0,
        savedThisMonth: 0,
        monthlySavingTotals: { income: 0, expense: 0 },
        openingBalance: 0,
      }));
    }
  }, [userId, resetState]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const derived = useMemo(() => {
    const today = new Date();
    const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthlyExpenses = state.expenses.filter((e) => isWithinRange(e.spent_at, monthStartDate, monthEndDate));
    const monthlyIncomes = state.incomes.filter((i) => isWithinRange(i.occurred_on, monthStartDate, monthEndDate));

    const expenseTotal = sumBy(monthlyExpenses, (e) => e.amount);
    const incomeTotal = sumBy(monthlyIncomes, (i) => i.amount);

    const expenseCount = monthlyExpenses.length;
    const incomeCount = monthlyIncomes.length;
    const uniqueExpenseDays = new Set(monthlyExpenses.map((e) => e.spent_at)).size;

    const monthlyStats = {
      income: incomeTotal,
      expense: expenseTotal,
      incomeCount,
      expenseCount,
      avgExpensePerDay: uniqueExpenseDays ? expenseTotal / uniqueExpenseDays : 0,
    };

    const buildChartForRange = (rangeKey) => {
      const baseBuckets = buildBaseBuckets(rangeKey, today);

      const expenseMap = {};
      state.expenses.forEach((row) => {
        const key = bucketKeyForDate(row.spent_at, rangeKey);
        if (!key) return;
        expenseMap[key] = (expenseMap[key] || 0) + Number(row.amount || 0);
      });

      const incomeMap = {};
      state.incomes.forEach((row) => {
        const key = bucketKeyForDate(row.occurred_on, rangeKey);
        if (!key) return;
        incomeMap[key] = (incomeMap[key] || 0) + Number(row.amount || 0);
      });

      const expenses = baseBuckets.map((bucket) => ({ ...bucket, value: Number(expenseMap[bucket.key] || 0) }));
      const savings = baseBuckets.map((bucket, idx) => {
        const incomeVal = Number(incomeMap[bucket.key] || 0);
        const expenseVal = Number(expenses[idx]?.value || 0);
        return { ...bucket, value: Math.max(0, incomeVal - expenseVal) };
      });

      return { expenses, savings };
    };

    const chartSeriesByRange = {
      "7d": buildChartForRange("7d"),
      "30d": buildChartForRange("30d"),
      "6m": buildChartForRange("6m"),
      "1y": buildChartForRange("1y"),
    };

    const topCategoriesByRange = Object.entries(rangeDaysLookup).reduce((acc, [rangeKey, days]) => {
      const from = new Date(today);
      from.setDate(today.getDate() - (days - 1));
      const fromStr = from.toISOString().slice(0, 10);

      const filtered = state.expenses.filter((e) => e.spent_at >= fromStr);
      const byCat = filtered.reduce((map, row) => {
        const key = row.category || "Uncategorized";
        map[key] = (map[key] || 0) + Number(row.amount || 0);
        return map;
      }, {});

      acc[rangeKey] = Object.entries(byCat)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      return acc;
    }, {});

    const recentExpenses = [...state.expenses]
      .sort((a, b) => (a.spent_at < b.spent_at ? 1 : -1))
      .slice(0, 5)
      .map((row) => ({ ...row, note: row.sub_category || row.title || "" }));

    const budgetSummary = (() => {
      const actualMap = monthlyExpenses.reduce((acc, e) => {
        const key = e.category || "Uncategorized";
        acc[key] = (acc[key] || 0) + Number(e.amount || 0);
        return acc;
      }, {});

      const budgetedCategories = state.budgets.map((b) => ({
        name: b.category,
        budget: Number(b.amount || 0),
        actual: Number(actualMap[b.category] || 0),
      }));

      const extraActuals = Object.entries(actualMap)
        .filter(([cat]) => !state.budgets.find((b) => b.category === cat))
        .map(([cat, value]) => ({ name: cat, budget: 0, actual: Number(value) }));

      const categoriesForDisplay = budgetedCategories.length ? [...budgetedCategories, ...extraActuals] : extraActuals;

      const totalBudget = sumBy(budgetedCategories, (c) => c.budget);
      const totalActual = sumBy(budgetedCategories, (c) => c.actual);

      return {
        categories: categoriesForDisplay.slice(0, 5),
        totalBudget,
        totalActual,
      };
    })();

    return {
      monthlyStats,
      chartSeriesByRange,
      topCategoriesByRange,
      recentExpenses,
      budgetSummary,
    };
  }, [state]);

  const value = useMemo(() => ({
    ...state,
    ...derived,
    refreshDashboardData: loadDashboardData,
  }), [state, derived, loadDashboardData]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}
