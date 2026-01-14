# ✅ BUDGET VS ACTUAL ARCHITECTURE - 8 STEP IMPLEMENTATION

## Final Mental Model
**Expenses → grouped by category + month → fill budget bars**

---

## STEP 1: Single Source of Truth - currentMonth (YYYY-MM-01)
**Location:** [BudgetsPage.jsx](src/components/Pages/Budgets/BudgetsPage.jsx)

✅ **DONE**
- `currentMonth` state always maintains `YYYY-MM-01` format
- Started with `const [currentMonth, setCurrentMonth] = useState("2026-01-01");`
- Month navigation keeps format: `${yearMonth}-01`

```javascript
// Always YYYY-MM-01
const [currentMonth, setCurrentMonth] = useState("2026-01-01");

// Navigation preserves format
const handlePrevMonth = () => {
  const date = new Date(currentMonth);
  date.setMonth(date.getMonth() - 1);
  const yearMonth = date.toISOString().split("T")[0].slice(0, 7);
  setCurrentMonth(`${yearMonth}-01`);  // Always ends with -01
};
```

---

## STEP 2: Fetch Budgets for the Month
**Location:** [BudgetsPage.jsx](src/components/Pages/Budgets/BudgetsPage.jsx) + [budgets.service.js](src/services/budgets.service.js)

✅ **DONE** - Service exists & verified
```javascript
// In BudgetsPage.jsx useEffect
const budgetsData = await getBudgetsByMonth(currentMonth);
// Returns: [{ category, amount }, ...]
```

**Service:** `getBudgetsByMonth(month)` in budgets.service.js
- Filters budgets by `month = currentMonth` (YYYY-MM-01)
- Returns planned budget amounts by category

---

## STEP 3: Fetch Expenses for the Date Range
**Location:** [BudgetsPage.jsx](src/components/Pages/Budgets/BudgetsPage.jsx) + [budgetActuals.service.js](src/services/budgetActuals.service.js)

✅ **DONE** - Helper function created
```javascript
// Helper function in BudgetsPage.jsx
function getEndOfMonth(monthStr) {
  const date = new Date(monthStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}

// In useEffect
const from = currentMonth;              // YYYY-MM-01
const to = getEndOfMonth(currentMonth); // YYYY-MM-31
const actualByCategory = await getActualSpendByCategory(from, to);
```

**Service:** `getActualSpendByCategory(from, to)` in budgetActuals.service.js
- Queries expenses between date range
- Returns aggregated amounts by category

---

## STEP 4: Aggregate Expenses by Category
**Location:** [budgetActuals.service.js](src/services/budgetActuals.service.js)

✅ **ALREADY IMPLEMENTED**
```javascript
// Service aggregates expenses automatically
return data.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
  return acc;
}, {});

// Result: { Food: 880, Entertainment: 1298, Transport: 1800 }
```

---

## STEP 5: Merge Budgets + Expenses (DRIVES THE UI)
**Location:** [BudgetsPage.jsx](src/components/Pages/Budgets/BudgetsPage.jsx)

✅ **IMPLEMENTED** - New `mergeData()` function
```javascript
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

// Called in useEffect
const mergedRows = mergeData(budgetsData || [], actualByCategory || {});
setRows(mergedRows);
```

**Single structure powers:**
- Budget bar width
- Progress percentage
- Over/Under labels
- Status colors
- Filter logic

---

## STEP 6: Render Budget Bars from Merged Data
**Location:** [CategoryBreakdownContainer.jsx](src/components/Pages/Budgets/BudgetCards/CategoryBreakdownContainer.jsx)

✅ **REFACTORED** - Now receives `rows` instead of `budgets` + `actuals`
```javascript
// OLD signature
export default function CategoryBreakdownContainer({
  budgets,
  actuals,
  // ...
}) {}

// NEW signature
export default function CategoryBreakdownContainer({
  rows,  // Single merged structure
  // ...
}) {}

// Usage in JSX
{rows.map((row) => (
  <div key={row.id} className="bVa-page-category-row">
    <div style={{ width: `${row.progress * 100}%` }} />
    {/* Status: {row.status} -> "over", "under", or "on-track" */}
    {/* Diff: {row.diff} -> actual - planned */}
  </div>
))}
```

---

## STEP 7: Handle Categories with NO Budget
**Location:** [CategoryBreakdownContainer.jsx](src/components/Pages/Budgets/BudgetCards/CategoryBreakdownContainer.jsx) + [TopSummaryContainer.jsx](src/components/Pages/Budgets/BudgetCards/TopSummaryContainer.jsx)

✅ **IMPLEMENTED**
```javascript
// Budget tab (STEP 6) = only categories with budgets
// rows = only budgeted categories (from Step 5 merge)

// Show in Expenses tab, NOT in Budget tab
// (Handled by mergeData only including budgeted categories)

if (!rows || rows.length === 0) {
  return <p>No budget data available for this month.</p>;
}
```

**Future Enhancement:** Unbudgeted spending card in Expenses tab

---

## STEP 8: What NOT to Do (LOCKED)
✅ **VERIFIED**

❌ Do NOT tag expenses with budget_id
- Expenses have NO `budget_id` field
- Connection is automatic via category

❌ Do NOT update budgets when expenses change
- Only merge read-only data
- No side effects on budget updates

❌ Do NOT store actual spent in DB
- Actual is calculated on-the-fly (Step 4 aggregation)
- No redundant DB column

❌ Do NOT add budget filters to expenses
- Budget page shows only budgeted categories (Step 7)
- Expenses page shows all expenses (filtered separately)

---

## COMPLETE DATA FLOW

```
[BudgetsPage.jsx]
    ↓
1. Set currentMonth = "2026-01-01" (source of truth)
    ↓
2. Call getBudgetsByMonth("2026-01-01")
    ↓
3. Call getActualSpendByCategory("2026-01-01", "2026-01-31")
    ↓
4. Service aggregates expenses by category
    ↓
5. mergeData() combines budgets + actuals into ROWS
    ↓
6. Pass ROWS to CategoryBreakdownContainer
    ↓
7. CategoryBreakdownContainer renders UI
    ├── Budget bars (from row.progress)
    ├── Over/Under status (from row.status, row.diff)
    └── Insights (from row aggregation)
    ↓
[RESULT: Automatic budget bars when subscription creates expense]
```

---

## TESTING CHECKLIST

- [ ] Load Budget page → sees current month (Jan 2026)
- [ ] Add a budget for "Food" = ₹5000
- [ ] See budget bar appear with 0% progress
- [ ] Create an expense "Groceries" = ₹500, category "Food"
- [ ] Refresh Budget page → bar shows 500/5000 = 10%
- [ ] Create subscription with payment = ₹200/month
- [ ] Trigger subscription payment (recordPayment)
- [ ] Refresh Budget page → bar updates to 700/5000 = 14%
- [ ] Change month → see different budget data
- [ ] Filter by "Over budget" → only shows overspent categories

---

## FILES MODIFIED

1. ✅ [BudgetsPage.jsx](src/components/Pages/Budgets/BudgetsPage.jsx)
   - Added `mergeData()` helper
   - Set currentMonth to YYYY-MM-01 format
   - Added `rows` state
   - Updated useEffect to merge data
   - Pass `rows` to containers

2. ✅ [CategoryBreakdownContainer.jsx](src/components/Pages/Budgets/BudgetCards/CategoryBreakdownContainer.jsx)
   - Changed from `budgets` + `actuals` → `rows`
   - All logic now works from merged structure
   - Status badges computed from row.diff, row.status

3. ✅ [TopSummaryContainer.jsx](src/components/Pages/Budgets/BudgetCards/TopSummaryContainer.jsx)
   - Changed from `budgets` + `actuals` → `rows`
   - Totals calculated from rows
   - Filter logic works on merged data

---

## MENTAL MODEL CONFIRMED

**"Expenses → grouped by category + month → fill budget bars"**

✅ Expenses auto-grouped by category (Step 4)
✅ Filtered by current month (Step 1-3)
✅ Merged with budgets (Step 5)
✅ Budget bars filled automatically (Step 6)
✅ No extra linking/tagging needed (Step 8)

