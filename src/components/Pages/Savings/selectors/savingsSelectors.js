const asNumber = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  return 0;
};

export const formatMonthKey = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
};

export const normalizeSavingsItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((row) => row && row.month)
    .map((row) => {
      const income = asNumber(row.income);
      const expenses = asNumber(row.expenses);
      return {
        month: row.month,
        income,
        expenses,
        savings: income - expenses,
      };
    })
    .sort((a, b) => b.month.localeCompare(a.month));
};

export const getCurrentMonthSavings = (items, selectedMonth) => {
  if (!Array.isArray(items) || !selectedMonth) return null;
  return items.find((item) => item.month === selectedMonth) || null;
};

export const getLastMonthSavings = (items, selectedMonth) => {
  if (!Array.isArray(items) || !selectedMonth) return null;
  const base = new Date(selectedMonth);
  base.setDate(1);
  base.setMonth(base.getMonth() - 1);
  const prevKey = formatMonthKey(base);
  return items.find((item) => item.month === prevKey) || null;
};

export const getSavingsRate = (monthData) => {
  if (!monthData || !monthData.income) return 0;
  const savings = (monthData.savings ?? monthData.income - monthData.expenses);
  return savings / monthData.income;
};

export const getProgressPercent = (monthData, targetAmount) => {
  if (!monthData || !targetAmount || targetAmount <= 0) return 0;
  const savings = Math.max(0, monthData.savings ?? monthData.income - monthData.expenses);
  return Math.min(100, Math.round((savings / targetAmount) * 100));
};

export const getForecast3Months = (items, horizon = 3) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { projected: 0, best: 0, likely: 0, average: 0, hasData: false, sampleSize: 0 };
  }
  const sorted = [...items].sort((a, b) => b.month.localeCompare(a.month));
  const window = sorted.slice(0, horizon);
  const savingsValues = window.map((m) => m.savings ?? m.income - m.expenses);
  const average = savingsValues.reduce((acc, val) => acc + val, 0) / window.length;
  const projected = average * horizon;
  const variance = Math.abs(average) * 0.07 * horizon; // small wiggle band
  const best = projected + variance;
  const likely = projected - variance;
  return { projected, best, likely, average, hasData: window.length > 0, sampleSize: window.length };
};

export const getBestMonth = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.reduce((best, item) => {
    const savings = item.savings ?? item.income - item.expenses;
    if (!best) return { ...item, savings };
    return savings > best.savings ? { ...item, savings } : best;
  }, null);
};

export const getLowMonth = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.reduce((worst, item) => {
    const savings = item.savings ?? item.income - item.expenses;
    if (!worst) return { ...item, savings };
    return savings < worst.savings ? { ...item, savings } : worst;
  }, null);
};

export const getConsistency = (items) => {
  if (!Array.isArray(items) || items.length === 0) return { savedMonths: 0, window: 0, ratio: 0 };
  const savedMonths = items.filter((item) => (item.savings ?? item.income - item.expenses) > 0).length;
  const window = items.length;
  return { savedMonths, window, ratio: window === 0 ? 0 : savedMonths / window };
};

export const getIncomeExpense = (monthData) => {
  if (!monthData) return { income: 0, expenses: 0 };
  return { income: monthData.income, expenses: monthData.expenses };
};

export const getDotCount = (rateFraction) => {
  const percent = Math.round((rateFraction || 0) * 100);
  if (percent <= 5) return 1;
  if (percent <= 10) return 2;
  if (percent <= 15) return 3;
  if (percent <= 20) return 4;
  return 5;
};

export const getDotTone = (amount) => {
  if (amount > 0) return "positive";
  if (amount < 0) return "negative";
  return "neutral";
};

const hasActivity = (item) => {
  if (!item) return false;
  const income = Number(item.income) || 0;
  const expenses = Number(item.expenses) || 0;
  return income !== 0 || expenses !== 0;
};

const filterEligibleMonths = (items) => {
  if (!Array.isArray(items)) return [];
  const currentMonthKey = formatMonthKey(new Date());
  return items
    .filter((item) => item?.month && item.month !== currentMonthKey && hasActivity(item))
    .slice(0, 12);
};

const getBestAndLowByRate = (items) => {
  if (!Array.isArray(items) || items.length < 2) return { best: null, low: null };

  const enriched = items.map((item) => ({
    ...item,
    savings: item.savings ?? item.income - item.expenses,
    savingsRate: getSavingsRate(item),
  }));

  const best = enriched.reduce((acc, item) => {
    if (!acc) return item;
    return item.savingsRate > acc.savingsRate ? item : acc;
  }, null);

  const low = enriched.reduce((acc, item) => {
    if (!acc) return item;
    return item.savingsRate < acc.savingsRate ? item : acc;
  }, null);

  return { best, low };
};

export const getEdgeStates = (items, currentMonth) => {
  const totalMonths = Array.isArray(items) ? items.length : 0;
  const hasIncome = currentMonth ? Number(currentMonth.income) > 0 : false;
  const hasExpense = currentMonth ? Number(currentMonth.expenses) > 0 : false;

  return {
    empty: totalMonths === 0,
    incomeNoExpense: hasIncome && !hasExpense,
    expenseNoIncome: hasExpense && !hasIncome,
    firstMonthUser: totalMonths === 1,
    singleMonthHistory: totalMonths === 1,
  };
};

export const deriveSavingsState = (items, savingsTargets = {}, selectedMonth) => {
  const normalized = normalizeSavingsItems(items);
  const sorted = [...normalized];

  if (sorted.length === 0) {
    return {
      summary: {
        month: selectedMonth || null,
        savings: 0,
        label: "Not enough data yet",
        tone: "neutral",
        savingsRate: 0,
        progressPercent: 0,
        savingsTarget: null,
        lastMonthSavings: null,
        hasData: false,
      },
      targetAmount: null,
      incomeExpense: { income: 0, expenses: 0 },
      forecast: getForecast3Months(sorted),
      bestMonth: null,
      lowMonth: null,
      consistency: getConsistency(sorted),
      edgeStates: getEdgeStates(sorted, null),
      effectiveMonth: null,
      lastMonth: null,
    };
  }

  const eligibleMonths = filterEligibleMonths(sorted);
  const current = getCurrentMonthSavings(sorted, selectedMonth) || null;
  const resolvedMonth = selectedMonth || null;
  const lastMonth = resolvedMonth ? getLastMonthSavings(sorted, resolvedMonth) : null;
  const targetAmount = resolvedMonth ? savingsTargets[resolvedMonth] ?? null : null;
  const incomeExpense = getIncomeExpense(current);
  const savingsValue = incomeExpense.income - incomeExpense.expenses;

  const { best: bestMonth, low: lowMonth } = getBestAndLowByRate(eligibleMonths);

  const summary = {
    month: resolvedMonth,
    savings: savingsValue,
    label: current ? (savingsValue >= 0 ? "Saved this month" : "Overspent this month") : "Not enough data yet",
    tone: getDotTone(savingsValue),
    savingsRate: getSavingsRate(current),
    progressPercent: getProgressPercent(current, targetAmount),
    savingsTarget: targetAmount,
    lastMonthSavings: lastMonth ? lastMonth.savings ?? lastMonth.income - lastMonth.expenses : null,
    hasData: Boolean(current),
  };

  return {
    summary,
    targetAmount,
    incomeExpense,
    forecast: getForecast3Months(sorted),
    bestMonth,
    lowMonth,
    consistency: getConsistency(sorted),
    edgeStates: getEdgeStates(sorted, current),
    effectiveMonth: current,
    lastMonth,
  };
};
