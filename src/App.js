// import React, { Suspense, lazy, useState } from "react";
// import { Routes, Route } from "react-router-dom";

// import LandingPage from "./components/landingPage/LandingPage";
// import LoginPage from "./components/Login/LoginPage";
// import Sidebar from "./components/Dashboard/Sidebar/Sidebar";

// const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
// const ExpensesPage = lazy(() => import("./components/Pages/Expenses/ExpensesPage"));
// const InsightsPage = lazy(() => import("./components/Pages/Insights/InsightsPage"));
// const SubscriptionsPage = lazy(() => import("./components/Pages/Subscriptions/SubscriptionsPage"));
// const BudgetsPage = lazy(() => import("./components/Pages/Budgets/BudgetsPage"));
// const ReportsPage = lazy(() => import("./components/Pages/Reports/ReportsPage"));

// export default function App() {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

//   return (
//     <>
//       <Suspense fallback={<div>Loading...</div>}>

//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/insights" element={<InsightsPage />} />
//           <Route path="/subscriptions" element={<SubscriptionsPage />} />
//           <Route path="/budgets" element={<BudgetsPage />} />
//           <Route path="/reports" element={<ReportsPage />} />
//           <Route path="/expenses" element={<ExpensesPage />} />
//         </Routes>
//       </Suspense>
//     </>
//   );
// }

import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage/LandingPage";
import LoginPage from "./components/Login/LoginPage";

// Layout shell (Snowfall + Sidebar + Outlet)
import DashboardLayout from "./components/Dashboard/DashboardLayout";

// Lazy-loaded dashboard pages
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const ExpensesPage = lazy(() => import("./components/Pages/Expenses/ExpensesPage"));
const InsightsPage = lazy(() => import("./components/Pages/Insights/InsightsPage"));
const SubscriptionsPage = lazy(() => import("./components/Pages/Subscriptions/SubscriptionsPage"));
const BudgetsPage = lazy(() => import("./components/Pages/Budgets/BudgetsPage"));
const ReportsPage = lazy(() => import("./components/Pages/Reports/ReportsPage"));
const GoalsPage = lazy(() => import("./components/Pages/Goals/GoalsPage"));
const Login = lazy(() => import("./components/Login/LoginPage"));

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (

    <Suspense fallback={<div>Loading…</div>}>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard Shell — Sidebar visible on all below */}
        <Route
          element={
            <DashboardLayout
              isSidebarExpanded={isSidebarExpanded}
              setIsSidebarExpanded={setIsSidebarExpanded}
            />
          }
        >

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Route>

      </Routes>

    </Suspense>

  );
}
