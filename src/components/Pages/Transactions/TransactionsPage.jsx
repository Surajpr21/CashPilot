// import React from "react";
// import ExpensesFilters from "./ExpensesFilters/ExpensesFilters";
// import ExpensesSummary from "./ExpensesFilters/ExpensesSummary";
// import ExpensesTable from "./ExpensesFilters/ExpensesTable";
// import ExpensesPagination from "./ExpensesFilters/ExpensesPagination";
// import "./ExpensesPage.css";

// export default function ExpensesPage() {
//   const expenses = [
//     { date: "31 May 2025", title: "Amazon", category: "Shopping", sub: "Amazon", amount: "₹318", mode: "UPI" },
//     { date: "30 May 2025", title: "PVR", category: "Movie", sub: "PVR", amount: "₹4,200", mode: "Card" },
//     { date: "30 May 2025", title: "Medplus", category: "Health", sub: "Medplus", amount: "₹540", mode: "Bank" },
//     { date: "26 May 2025", title: "Swiggy", category: "Food", sub: "Swiggy", amount: "₹160", mode: "UPI" },
//     { date: "24 May 2025", title: "Flipkart", category: "Shopping", sub: "Flipkart", amount: "₹1,600", mode: "Bank" },
//     { date: "20 May 2025", title: "Uber", category: "Travel", sub: "Uber", amount: "₹2,000", mode: "UPI" },
//     { date: "19 May 2025", title: "Petrol", category: "Auto", sub: "Petrol", amount: "₹1,400", mode: "Bank" },
//     { date: "18 May 2025", title: "Dropbox", category: "Software", sub: "Dropbox", amount: "₹450", mode: "UPI" },
//     { date: "16 May 2025", title: "Myntra", category: "Shopping", sub: "Myntra", amount: "₹1,200", mode: "Card" },
//     { date: "14 May 2025", title: "Concert tickets", category: "Entertainment", sub: "Concert tickets", amount: "₹2,700", mode: "UPI" }
//   ];

//   return (
//     <div className="expenses-page-container">
      
//       <div className="expenses-page-header">
//         <h1 className="expenses-page-title">Expenses</h1>
//         <p className="expenses-page-subtitle">Track and manage all your spending.</p>
//       </div>

//       <ExpensesFilters />
//       {/* <ExpensesSummary /> */}
//       <ExpensesTable expenses={expenses} />
//       <ExpensesPagination />
//     </div>
//   );
// }
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExpensesFilters from "./ExpensesFilters/ExpensesFilters";
import ExpensesTable from "./ExpensesFilters/ExpensesTable";
import "./ExpensesPage.css";
import { getExpensesPaginated } from "../../../services/expenses.service";
import { getIncomePaginated, deleteIncomeTransaction } from "../../../services/transactions.service";
import { useAuth } from "../../../contexts/AuthContext";
import ExpenseForm from "./ExpensesFilters/ExpenseForm/ExpenseForm";

const PAGE_SIZE = 10;

// Helper to get date range presets
function getDatePreset(preset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (preset === "thisMonth") {
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    return { from, to };
  }
  
  if (preset === "lastMonth") {
    const from = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const to = new Date(year, month, 0).toISOString().split("T")[0];
    return { from, to };
  }
  
  return { from: null, to: null };
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState("expenses");

  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [incomeRows, setIncomeRows] = useState([]);
  const [incomePage, setIncomePage] = useState(1);
  const [incomeTotalCount, setIncomeTotalCount] = useState(0);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeError, setIncomeError] = useState("");
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const { session } = useAuth();
  const lastExpensesKeyRef = useRef(null);
  const lastIncomeKeyRef = useRef(null);

  // Filter state
  const [filters, setFilters] = useState(() => {
    const { from, to } = getDatePreset("thisMonth");
    return {
      fromDate: from,
      toDate: to,
      category: "",
      minAmount: "",
      maxAmount: "",
      paymentMode: "",
      source: "",
      search: "",
    };
  });

  const loadExpenses = useCallback(
    async ({ force = false } = {}) => {
      const key = JSON.stringify({ page, filters, userId: session?.user?.id });
      if (!force && lastExpensesKeyRef.current === key) {
        return;
      }

      lastExpensesKeyRef.current = key;
      setLoading(true);
      try {
        const res = await getExpensesPaginated(page, { ...filters, userId: session?.user?.id });
        setExpenses(res.expenses || []);
        setTotalCount(res.total || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load expenses");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    },
    [page, filters, session?.user?.id]
  );

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const loadIncome = useCallback(
    async ({ force = false } = {}) => {
      if (!session?.user?.id) return;

      const key = JSON.stringify({ page: incomePage, filters, userId: session.user.id });
      if (!force && lastIncomeKeyRef.current === key) {
        return;
      }

      lastIncomeKeyRef.current = key;
      setIncomeLoading(true);
      try {
        const res = await getIncomePaginated(incomePage, { ...filters, userId: session?.user?.id });
        setIncomeRows(res.incomes || []);
        setIncomeTotalCount(res.total || 0);

        setIncomeError("");
      } catch (err) {
        setIncomeError(err.message || "Failed to load income");
        setIncomeRows([]);
      } finally {
        setIncomeLoading(false);
      }
    },
    [incomePage, filters, session?.user?.id]
  );

  useEffect(() => {
    if (activeTab === "income") {
      loadIncome();
    }
  }, [activeTab, loadIncome, filters]);

  const refetchExpenses = async () => {
    await loadExpenses({ force: true });
  };

  const handleIncomeSaved = async () => {
    setShowIncomeForm(false);
    setEditingIncome(null);
    await loadIncome({ force: true });
  };

  const handleIncomeDelete = async (row) => {
    if (!row?.id) return;
    const confirmed = window.confirm("Delete this income entry?");
    if (!confirmed) return;

    setIncomeLoading(true);
    try {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to delete income");
      }
      await deleteIncomeTransaction(row.id, session.user.id);
      await loadIncome({ force: true });
    } catch (err) {
      setIncomeError(err.message || "Failed to delete income");
    } finally {
      setIncomeLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIncomePage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const incomeTotalPages = Math.ceil(incomeTotalCount / PAGE_SIZE);

  const incomeTotalAmount = useMemo(
    () => incomeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [incomeRows]
  );
  const formattedIncomeTotal = useMemo(
    () => `+₹${Number(incomeTotalAmount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    [incomeTotalAmount]
  );

  const incomePreset = useMemo(() => {
    const thisMonth = getDatePreset("thisMonth");
    const lastMonth = getDatePreset("lastMonth");
    if (filters.fromDate === thisMonth.from && filters.toDate === thisMonth.to) return "thisMonth";
    if (filters.fromDate === lastMonth.from && filters.toDate === lastMonth.to) return "lastMonth";
    return "custom";
  }, [filters.fromDate, filters.toDate]);

  const handleIncomePresetChange = (preset) => {
    if (preset === "thisMonth" || preset === "lastMonth") {
      const { from, to } = getDatePreset(preset);
      const next = { ...filters, fromDate: from, toDate: to };
      setFilters(next);
      setIncomePage(1);
      setPage(1);
    }
  };

  return (
    <div className="expenses-page-container">
      {/* SVG Background */}
     <div className="expenses-page-svg-background">
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1440 590"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      {/* Background gradient (your existing one) */}
      <linearGradient id="bgGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#EFEDF8" />
        <stop offset="100%" stopColor="#DDDBF3" />
      </linearGradient>

      {/* MASK to fade left, right, and bottom */}
      <linearGradient id="fadeMask" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="1" />
        <stop offset="55%" stopColor="white" stopOpacity="0.9" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="sideFadeMask" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="20%" stopColor="white" stopOpacity="1" />
        <stop offset="80%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>

      <mask id="combinedMask">
        <rect width="100%" height="100%" fill="url(#fadeMask)" />
        <rect width="100%" height="100%" fill="url(#sideFadeMask)" />
      </mask>
    </defs>

    {/* Waves */}
    <g mask="url(#combinedMask)">
      <path
        d="M 0,600 L 0,300 C 113.14832535885168,307.70334928229664 226.29665071770336,315.4066985645933 332,285 C 437.70334928229664,254.5933014354067 535.9617224880383,186.07655502392342 626,161 C 716.0382775119617,135.92344497607658 797.8564593301435,154.28708133971293 877,136 C 956.1435406698565,117.71291866028707 1032.6124401913876,62.77511961722488 1126,34 C 1219.3875598086124,5.224880382775121 1329.6937799043062,2.6124401913875603 1440,0 L 1440,600 L 0,600 Z"
        fill="url(#bgGradient)"
        fillOpacity="0.55"
      />

      <path
        d="M 0,600 L 0,500 C 90.78468899521536,521.6267942583731 181.56937799043072,543.2535885167464 275,533 C 368.4306220095693,522.7464114832536 464.50717703349267,480.6124401913876 580,435 C 695.4928229665073,389.3875598086124 830.4019138755982,340.29665071770336 912,309 C 993.5980861244018,277.70334928229664 1021.8851674641148,264.200956937799 1101,249 C 1180.1148325358852,233.79904306220098 1310.0574162679427,216.8995215311005 1440,200 L 1440,600 L 0,600 Z"
        fill="url(#bgGradient)"
        fillOpacity="0.9"
      />
    </g>
  </svg>
</div>


      <div className="expenses-page-content">
        <div className="expenses-page-header">
          <div className="transactions-toggle">
            <button
              className={activeTab === "expenses" ? "active" : ""}
              onClick={() => setActiveTab("expenses")}
            >
              Expenses
            </button>
            <button
              className={activeTab === "income" ? "active" : ""}
              onClick={() => setActiveTab("income")}
            >
              Income
            </button>
          </div>
          <h1 className="expenses-page-title">Transactions</h1>
          <p className="expenses-page-subtitle">Track expenses and income in one view. Expenses stay the default.</p>
        </div>

        {activeTab === "expenses" && (
          <>
            <ExpensesFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onExpenseAdded={refetchExpenses} 
            />

            {loading && <div className="expenses-page-loading">Loading expenses…</div>}
            {error && <div className="expenses-page-error" style={{ color: "red" }}>{error}</div>}

            {!loading && !error && (
              <>
                <ExpensesTable expenses={expenses} view="expense" />
                
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    Page {page} of {totalPages || 1}
                  </span>

                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "income" && (
          <div className="income-view">
            <div className="expenses-page-filters income-filters">
              <select
                className="expenses-page-filter"
                value={incomePreset}
                onChange={(e) => handleIncomePresetChange(e.target.value)}
              >
                <option value="thisMonth">This month</option>
                <option value="lastMonth">Last month</option>
                <option value="custom">Custom (from expenses filters)</option>
              </select>

              <div className="income-summary-group">
                <div className="expenses-page-summary-item">
                  <span className="expenses-page-summary-label">Total income (this month):</span>
                  <span className="expenses-page-summary-value income-amount">{formattedIncomeTotal}</span>
                </div>
                <div className="expenses-page-summary-item">
                  <span className="expenses-page-summary-label">Entries:</span>
                  <span className="expenses-page-summary-value">{incomeRows.length}</span>
                </div>
              </div>
              <div className="income-actions">
                <button className="expenses-page-add-expense" onClick={() => { setEditingIncome(null); setShowIncomeForm(true); }}>
                  Add Income
                </button>
                <a className="savings-link" href="/savings">View savings summary →</a>
              </div>
            </div>

            {incomeLoading && <div className="expenses-page-loading">Loading income…</div>}
            {incomeError && <div className="expenses-page-error" style={{ color: "red" }}>{incomeError}</div>}

            {!incomeLoading && !incomeError && (
              <>
                <ExpensesTable
                  expenses={incomeRows}
                  view="income"
                  onEdit={(row) => {
                    setEditingIncome(row);
                    setShowIncomeForm(true);
                  }}
                  onDelete={handleIncomeDelete}
                />

                <div className="pagination">
                  <button
                    disabled={incomePage === 1}
                    onClick={() => setIncomePage(incomePage - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    Page {incomePage} of {incomeTotalPages || 1}
                  </span>

                  <button
                    disabled={incomePage === incomeTotalPages || incomeTotalPages === 0}
                    onClick={() => setIncomePage(incomePage + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showIncomeForm && (
        <div
          className="expense-modal-overlay"
          onClick={() => setShowIncomeForm(false)}
        >
          <div
            className="expense-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="expense-modal-close"
              aria-label="Close"
              onClick={() => setShowIncomeForm(false)}
            >
              ×
            </button>
            <ExpenseForm
              mode="income"
              initialData={editingIncome}
              onClose={() => setShowIncomeForm(false)}
              onSaved={handleIncomeSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}