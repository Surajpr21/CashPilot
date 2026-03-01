import React, { useState, useEffect } from "react";
import "./BudgetVsActual.css";
import TopSummaryContainer from "./BudgetCards/TopSummaryContainer";
import CategoryBreakdownContainer from "./BudgetCards/CategoryBreakdownContainer";
import AddBudgetModal from "./BudgetCards/AddBudgetModal";
import { getBudgetsByMonth } from "../../../services/budgets.service";
import { getActualSpendByCategory } from "../../../services/budgetActuals.service";

// Keep month math stable across timezones by working with year/month integers and manual formatting.
const pad2 = (n) => String(n).padStart(2, "0");
const formatMonthKey = (year, monthIndex) => `${year}-${pad2(monthIndex + 1)}-01`;
const parseMonthKey = (monthKey) => {
  const [y, m] = (monthKey || "").split("-").map(Number);
  return { year: y || 1970, monthIndex: (m || 1) - 1 };
};

function getEndOfMonth(monthStr) {
  const { year, monthIndex } = parseMonthKey(monthStr);
  const end = new Date(year, monthIndex + 1, 0);
  return `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}`;
}

function mergeData(budgets, actualByCategory) {
  return budgets.map((budget) => {
    const actual = actualByCategory[budget.category] || 0;
    const planned = budget.amount;
    const diff = actual - planned;

    return {
      id: budget.id,
      category: budget.category,
      planned,
      actual,
      diff,
      progress: planned > 0 ? Math.min(actual / planned, 1) : 0,
      status: diff > 0 ? "over" : diff < 0 ? "under" : "on-track",
    };
  });
}

export default function BudgetVsActualPage() {
  const [budgets, setBudgets] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const startOfThisMonth = formatMonthKey(today.getFullYear(), today.getMonth());

  const [currentMonth, setCurrentMonth] = useState(startOfThisMonth);  // STEP 1: Always YYYY-MM-01
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format month to display (e.g., "January 2026")
  const getMonthDisplay = () => {
    const { year, monthIndex } = parseMonthKey(currentMonth);
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const from = currentMonth;
        const to = getEndOfMonth(currentMonth);

        const budgetsData = await getBudgetsByMonth(currentMonth);
        const actualByCategory = await getActualSpendByCategory(from, to);
        const mergedRows = mergeData(budgetsData || [], actualByCategory || {});

        setBudgets(budgetsData || []);
        setRows(mergedRows);
      } catch (error) {
        console.error("Error loading budget data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const { year, monthIndex } = parseMonthKey(currentMonth);
    const date = new Date(year, monthIndex, 1);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(formatMonthKey(date.getFullYear(), date.getMonth()));
  };

  const handleNextMonth = () => {
    const { year, monthIndex } = parseMonthKey(currentMonth);
    const date = new Date(year, monthIndex, 1);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(formatMonthKey(date.getFullYear(), date.getMonth()));
  };

  // Handle successful budget addition
  const handleBudgetAdded = (newBudget) => {
    setBudgets((prev) => [...prev, newBudget]);
    const updatedRows = mergeData([...budgets, newBudget], 
      Object.fromEntries(rows.map(r => [r.category, r.actual])));
    setRows(updatedRows);
  };

  return (
    <div className="bVa-page-wrapper">
      {/* Page Header */}
      <div className="bVa-page-header">
        <div>
          <h1 className="bVa-page-title">Budget vs Actual</h1>
          <p className="bVa-page-subtitle">
            Track how your spending compares to your planned budget
          </p>
        </div>
      </div>

      {/* Container 1: Summary with merged data */}
      <TopSummaryContainer
        rows={rows}
        loading={loading}
        onAddBudgetClick={() => setIsModalOpen(true)}
        monthDisplay={getMonthDisplay()}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Container 2: Category breakdown with merged data */}
      <CategoryBreakdownContainer
        rows={rows}
        loading={loading}
        currentMonth={currentMonth}
        setBudgets={setBudgets}
      />

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMonth={currentMonth}
        budgets={budgets}
        onSuccess={handleBudgetAdded}
      />
    </div>
  );
}
