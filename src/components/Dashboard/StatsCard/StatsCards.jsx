import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./StatsCards.css";
import {
  ArrowTrendingUpIcon as TrendingUp,
  ArrowTrendingDownIcon as TrendingDown,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../../contexts/AuthContext";
import { getExpenseStats } from "../../../services/expenses.service";
import { getIncomeSummary } from "../../../services/transactions.service";

const baseCardData = [
  {
    title: "Total Balance",
    value: "₹8,98,450",
      gradient: "linear-gradient(to bottom, #C9C3F4 0%, #E5E1FB 100%)",
  
    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M200-320v-200q0-17 11.5-28.5T240-560q17 0 28.5 11.5T280-520v200q0 17-11.5 28.5T240-280q-17 0-28.5-11.5T200-320Zm240 0v-200q0-17 11.5-28.5T480-560q17 0 28.5 11.5T520-520v200q0 17-11.5 28.5T480-280q-17 0-28.5-11.5T440-320ZM120-120q-17 0-28.5-11.5T80-160q0-17 11.5-28.5T120-200h720q17 0 28.5 11.5T880-160q0 17-11.5 28.5T840-120H120Zm560-200v-200q0-17 11.5-28.5T720-560q17 0 28.5 11.5T760-520v200q0 17-11.5 28.5T720-280q-17 0-28.5-11.5T680-320Zm160-320H116q-15 0-25.5-10.5T80-676v-22q0-11 5.5-19t14.5-13l344-172q17-8 36-8t36 8l342 171q11 5 16.5 15t5.5 21v15q0 17-11.5 28.5T840-640Zm-582-80h444-444Zm0 0h444L480-830 258-720Z" /></svg>,
    change: 20.76,
    positive: true,
  },
  {
    title: "Spent This Month",
    value: "₹24,093",
      gradient: "linear-gradient(to bottom, #BCDCD7 0%, #CFEADF 100%)",
    // gradient: "linear-gradient(to bottom, #AEC8F2 0%, #D4E2FA 100%)",
    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm400 240H120q-33 0-56.5-23.5T40-240v-400q0-17 11.5-28.5T80-680q17 0 28.5 11.5T120-640v400h640q17 0 28.5 11.5T800-200q0 17-11.5 28.5T760-160ZM280-400v-320 320Z" /></svg>,
    change: 9.23,
    positive: false,
  },
  {
    title: "Saved This Month",
    value: "₹12,000",
     gradient: "linear-gradient(to bottom, #AEC8F2 0%, #D4E2FA 100%)",
    // gradient: "linear-gradient(to bottom, #C9C3F4 0%, #E5E1FB 100%)",
    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M240-160q-66 0-113-47T80-320v-320q0-66 47-113t113-47h480q66 0 113 47t47 113v320q0 66-47 113t-113 47H240Zm0-480h480q22 0 42 5t38 16v-21q0-33-23.5-56.5T720-720H240q-33 0-56.5 23.5T160-640v21q18-11 38-16t42-5Zm-74 130 445 108q9 2 18 0t17-8l139-116q-11-15-28-24.5t-37-9.5H240q-26 0-45.5 13.5T166-510Z" /></svg>,
    change: 18.76,
    positive: true,
  },
  {
    title: "Investments",
    value: "₹1,50,000",
    gradient: "linear-gradient(to bottom, #A9E1C1 0%, #D7F3E5 100%)",
    icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M320-490v-170q0-25 17.5-42.5T380-720q25 0 42.5 17.5T440-660v170q0 25-17.5 42.5T380-430q-25 0-42.5-17.5T320-490Zm200-9v-321q0-25 17.5-42.5T580-880q25 0 42.5 17.5T640-820v321q0 30-18.5 45T580-439q-23 0-41.5-15T520-499ZM120-361v-139q0-25 17.5-42.5T180-560q25 0 42.5 17.5T240-500v139q0 30-18.5 45T180-301q-23 0-41.5-15T120-361Zm96 243q-26 0-36.5-24.5T188-186l164-164q11-11 26.5-12t27.5 10l114 98 224-224h-24q-17 0-28.5-11.5T680-518q0-17 11.5-28.5T720-558h120q17 0 28.5 11.5T880-518v120q0 17-11.5 28.5T840-358q-17 0-28.5-11.5T800-398v-24L550-172q-11 11-26.5 12T496-170l-114-98-138 138q-5 5-12.5 8.5T216-118Z" /></svg>,
    change: 15.0,
    positive: true,
  },
];



const numberData = [
  {
    label: "Transactions",
    value: "78",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm400 240H120q-33 0-56.5-23.5T40-240v-400q0-17 11.5-28.5T80-680q17 0 28.5 11.5T120-640v400h640q17 0 28.5 11.5T800-200q0 17-11.5 28.5T760-160ZM280-400v-320 320Z" /></svg>
    ),
  },
  {
    label: "Subscriptions",
    value: "56",
    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M160-80q-33 0-56.5-23.5T80-160v-400q0-33 23.5-56.5T160-640h640q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H160Zm0-80h640v-400H160v400Zm271-61 184-122q9-6 9-17t-9-17L431-499q-10-7-20.5-1.5T400-483v246q0 12 10.5 17.5T431-221ZM200-680q-17 0-28.5-11.5T160-720q0-17 11.5-28.5T200-760h560q17 0 28.5 11.5T800-720q0 17-11.5 28.5T760-680H200Zm120-120q-17 0-28.5-11.5T280-840q0-17 11.5-28.5T320-880h320q17 0 28.5 11.5T680-840q0 17-11.5 28.5T640-800H320ZM160-160v-400 400Z"/></svg>
    ),
  },
  {
    label: "Savings Rate",
    value: "203",
    icon: (
   <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#24454A"><path d="M200-120q-33 0-56.5-23.5T120-200v-600q0-17 11.5-28.5T160-840q17 0 28.5 11.5T200-800v600h600q17 0 28.5 11.5T840-160q0 17-11.5 28.5T800-120H200Zm80-120q-17 0-28.5-11.5T240-280v-280q0-17 11.5-28.5T280-600h80q17 0 28.5 11.5T400-560v280q0 17-11.5 28.5T360-240h-80Zm200 0q-17 0-28.5-11.5T440-280v-480q0-17 11.5-28.5T480-800h80q17 0 28.5 11.5T600-760v480q0 17-11.5 28.5T560-240h-80Zm200 0q-17 0-28.5-11.5T640-280v-120q0-17 11.5-28.5T680-440h80q17 0 28.5 11.5T800-400v120q0 17-11.5 28.5T760-240h-80Z"/></svg>
    ),
  },
];

function formatCurrency(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const StatsCards = () => {
  const { profile, session } = useAuth();

  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    incomeCount: 0,
    expenseCount: 0,
    avgExpensePerDay: 0,
  });
  const lastLoadKeyRef = useRef(null);

  const monthRange = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    return { from, to };
  }, []);

  const loadTransactions = useCallback(
    async ({ force = false } = {}) => {
      const key = JSON.stringify({ from: monthRange.from, to: monthRange.to, userId: session?.user?.id });
      if (!force && lastLoadKeyRef.current === key) {
        return;
      }

      lastLoadKeyRef.current = key;

      try {
        const userId = session?.user?.id;

        const [expenseRes, incomeRes] = await Promise.all([
          getExpenseStats(monthRange.from, monthRange.to, userId),
          getIncomeSummary({ fromDate: monthRange.from, toDate: monthRange.to, userId }),
        ]);

        const expenseTotal = expenseRes?.data ? Number(expenseRes.data.total_spent || 0) : 0;
        const expenseCount = expenseRes?.data ? Number(expenseRes.data.transactions || 0) : 0;
        const avgPerDay = expenseRes?.data ? Number(expenseRes.data.avg_per_day || 0) : 0;

        const incomeTotal = incomeRes?.total ? Number(incomeRes.total || 0) : 0;
        const incomeCount = incomeRes?.count ? Number(incomeRes.count || 0) : 0;

        setTotals({
          income: incomeTotal,
          expense: expenseTotal,
          incomeCount,
          expenseCount,
          avgExpensePerDay: avgPerDay,
        });
      } catch (err) {
        setTotals({ income: 0, expense: 0, incomeCount: 0, expenseCount: 0, avgExpensePerDay: 0 });
      }
    },
    [monthRange, session]
  );

  useEffect(() => {
    loadTransactions();
    const handler = () => loadTransactions({ force: true });
    window.addEventListener("transactions:updated", handler);
    return () => window.removeEventListener("transactions:updated", handler);
  }, [loadTransactions]);

  const derivedCards = useMemo(() => {
    const opening = Number(profile?.opening_balance ?? 0);
    const balance = opening + totals.income - totals.expense;
    const monthlySavings = totals.income - totals.expense;

    return baseCardData.map((item) => {
      if (item.title === "Total Balance") {
        return { ...item, value: formatCurrency(balance), positive: balance >= 0 };
      }
      if (item.title === "Spent This Month") {
        return { ...item, value: formatCurrency(totals.expense), positive: totals.expense <= totals.income };
      }
      if (item.title === "Saved This Month") {
        return {
          ...item,
          value: formatCurrency(monthlySavings),
          positive: monthlySavings >= 0,
          change: totals.income ? Number(((monthlySavings / totals.income) * 100).toFixed(2)) : item.change,
        };
      }
      return item;
    });
  }, [profile, totals]);

  const derivedNumbers = useMemo(() => {
    const savingsRate = totals.income ? Math.max(0, Math.round(((totals.income - totals.expense) / totals.income) * 100)) : 0;

    return [
      { ...numberData[0], value: String(totals.incomeCount + totals.expenseCount) },
      numberData[1],
      { ...numberData[2], value: `${savingsRate}%` },
    ];
  }, [totals]);

  return (
    <div className="stats-section-container">
      {/* Left: Cards */}
      <div className="stats-left">
        {derivedCards.map((item, index) => (
          // <div
          //   key={index}
          //   className="stats-card"
          //   style={{ background: item.gradient }}
          // >
          //   <div className="stats-card-header">
          //     <div className="card-icon">
          //       {React.cloneElement(item.icon, { className: "hero-icon" })}
          //     </div>
          //     <h3 className="stats-card-title">{item.title}</h3>
          //   </div>

          //   <div>
          //     <p className="stats-card-value">{item.value}</p>

          //     {/* ✅ Comparison badge */}
          //     <div
          //       className={`stats-card-change-badge ${item.positive ? "positive" : "negative"
          //         }`}
          //     >
          //       <span>{item.change}%</span>
          //       {item.positive ? (
          //         <TrendingUp className="arrow-icon" />
          //       ) : (
          //         <TrendingDown className="arrow-icon" />
          //       )}
          //     </div>
          //   </div>
          // </div>
          <div
            key={index}
            className="stats-card"
            style={{ background: item.gradient }}
          >
            {/* Soft SVG Background */}
            {item.title === "Total Balance" && (
              <div className="stats-card-bg" aria-hidden>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1440 590"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M 0,600 L 0,300 C 82.52307692307696,282.7910256410256 165.0461538461539,265.5820512820513 255,272 C 344.9538461538461,278.4179487179487 442.3384615384614,308.46282051282054 519,279 C 595.6615384615386,249.53717948717946 651.6000000000001,160.56666666666666 731,123 C 810.3999999999999,85.43333333333334 913.2615384615385,99.27051282051282 997,102 C 1080.7384615384615,104.72948717948718 1145.353846153846,96.35128205128206 1216,65 C 1286.646153846154,33.64871794871795 1363.323076923077,-20.675641025641024 1440,-75 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="0.45"
                  />
                  <path d="M 0,600 L 0,500 C 65.42564102564103,473.8782051282051 130.85128205128206,447.7564102564102 219,425 C 307.14871794871794,402.2435897435898 418.02051282051275,382.85256410256414 513,366 C 607.9794871794873,349.14743589743586 687.0666666666666,334.8333333333333 754,332 C 820.9333333333334,329.1666666666667 875.7128205128206,337.8141025641026 938,312 C 1000.2871794871794,286.1858974358974 1070.0820512820512,225.9102564102564 1155,189 C 1239.9179487179488,152.0897435897436 1339.9589743589745,138.5448717948718 1440,125 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
            )}

            {item.title === "Spent This Month" && (
              <div className="stats-card-bg" aria-hidden>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1440 590"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0,600 L 0,300 C 90.82820512820513,319.45000000000005 181.65641025641025,338.90000000000003 260,298 C 338.34358974358975,257.09999999999997 404.2025641025641,155.84999999999997 485,152 C 565.7974358974359,148.15000000000003 661.5333333333332,241.70000000000002 738,222 C 814.4666666666668,202.29999999999998 871.6641025641027,69.35 957,28 C 1042.3358974358973,-13.349999999999998 1155.8102564102564,36.9 1241,35 C 1326.1897435897436,33.1 1383.0948717948718,-20.95 1440,-75 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="0.53"
                  />
                  <path
                    d="M 0,600 L 0,500 C 84.51794871794871,506.80641025641023 169.03589743589743,513.6128205128205 255,500 C 340.9641025641026,486.3871794871795 428.374358974359,452.3551282051282 495,442 C 561.625641025641,431.6448717948718 607.4666666666667,444.96666666666664 696,407 C 784.5333333333333,369.03333333333336 915.7589743589742,279.7782051282052 993,254 C 1070.2410256410258,228.22179487179486 1093.497435897436,265.92051282051284 1159,255 C 1224.502564102564,244.0794871794872 1332.251282051282,184.53974358974358 1440,125 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="1"
                  />
                </svg>
              </div>
            )}

            {item.title === "Saved This Month" && (
              <div className="stats-card-bg" aria-hidden>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1440 590"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0,600 L 0,300 C 93.52051282051283,329.08846153846156 187.04102564102567,358.1769230769231 255,357 C 322.95897435897433,355.8230769230769 365.3564102564102,324.3807692307692 449,275 C 532.6435897435898,225.6192307692308 657.5333333333334,158.3 749,136 C 840.4666666666666,113.69999999999997 898.5102564102563,136.41923076923075 979,127 C 1059.4897435897437,117.58076923076923 1162.4256410256412,76.02307692307693 1243,37 C 1323.5743589743588,-2.023076923076925 1381.7871794871794,-38.511538461538464 1440,-75 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="0.53"
                  />
                  <path
                    d="M 0,600 L 0,500 C 62.88717948717948,460.8448717948718 125.77435897435896,421.68974358974356 196,431 C 266.22564102564104,440.31025641025644 343.7897435897436,498.08589743589744 438,478 C 532.2102564102564,457.91410256410256 643.0666666666667,359.96666666666664 729,330 C 814.9333333333333,300.03333333333336 875.9435897435897,338.0474358974359 948,308 C 1020.0564102564103,277.9525641025641 1103.1589743589743,179.84358974358975 1187,138 C 1270.8410256410257,96.15641025641025 1355.4205128205128,110.57820512820513 1440,125 L 1440,600 L 0,600 Z"
                    fill="#ffffff"
                    fillOpacity="1"
                  />
                </svg>
              </div>
            )}

            {item.title === "Investments" && (
              <div className="stats-card-bg" aria-hidden>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1440 490"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0,500 L 0,275 C 76.91866028708131,313.3349282296651 153.83732057416262,351.66985645933016 261,318 C 368.1626794258374,284.33014354066984 505.5693779904308,178.6555023923445 598,147 C 690.4306220095692,115.34449760765553 737.8851674641147,157.7081339712919 824,154 C 910.1148325358853,150.2918660287081 1034.88995215311,100.51196172248804 1144,63 C 1253.11004784689,25.488038277511965 1346.5550239234449,0.24401913875598247 1440,-25 L 1440,500 L 0,500 Z"
                    fill="#ffffff"
                    fillOpacity="0.53"
                  />
                  <path
                    d="M 0,500 L 0,441 C 66.75598086124404,417.9952153110048 133.51196172248808,394.99043062200957 234,384 C 334.4880382775119,373.00956937799043 468.7081339712918,374.0334928229665 574,359 C 679.2918660287082,343.9665071770335 755.6555023923447,312.87559808612446 850,301 C 944.3444976076553,289.12440191387554 1056.66985645933,296.46411483253587 1158,273 C 1259.33014354067,249.53588516746413 1349.665071770335,195.26794258373207 1440,141 L 1440,500 L 0,500 Z"
                    fill="#ffffff"
                    fillOpacity="1"
                  />
                </svg>
              </div>
            )}




            <div className="stats-card-header">
              <div className="card-icon">
                {React.cloneElement(item.icon, { className: "hero-icon" })}
              </div>
              <h3 className="stats-card-title">{item.title}</h3>
            </div>

            <div>
              <p className="stats-card-value">{item.value}</p>

              <div
                className={`stats-card-change-badge ${item.positive ? "positive" : "negative"
                  }`}
              >
                <span>{item.change}%</span>
                {item.positive ? (
                  <TrendingUp className="arrow-icon" />
                ) : (
                  <TrendingDown className="arrow-icon" />
                )}
              </div>
            </div>
          </div>

        ))}
      </div>

      {/* Right: Numbers */}
      <div className="stats-right">
        {derivedNumbers.map((num, index) => (
          <div key={index} className="stats-number-card">
            <div className="stats-number-value">{num.value}</div>
            <div className="stats-number-icon">{num.icon}</div>
            <div className="stats-number-label">{num.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
