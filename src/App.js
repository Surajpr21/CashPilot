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

import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/Login/LoginPage";
import SignupPage from "./components/Login/SignupPage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Onboarding from "./components/Pages/Onboarding/Onboarding";
import { useAuth } from "./contexts/AuthContext";

const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const ExpensesPage = lazy(() => import("./components/Pages/Expenses/ExpensesPage"));
const SubscriptionsPage = lazy(() => import("./components/Pages/Subscriptions/SubscriptionsPage"));
const BudgetsPage = lazy(() => import("./components/Pages/Budgets/BudgetsPage"));
const GoalsPage = lazy(() => import("./components/Pages/Goals/GoalsPage"));
const SavingsPage = lazy(() => import("./components/Pages/Savings/SavingsPage"));
const AssetsPage = lazy(() => import("./components/Pages/assets/AssetsPage"));
const ProfilePage = lazy(() => import("./pages/profile/Profile"));

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", fontSize: 16 }}>
      {message}
    </div>
  );
}

function ProtectedRoute({ children, allowOnboarding = false }) {
  const { session, profile, financial, initializing, profileLoading } = useAuth();

  if (initializing || profileLoading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !financial) {
    return <LoadingScreen message="Preparing your profile..." />;
  }

  if (!financial.onboarding_completed) {
    return allowOnboarding ? children : <Navigate to="/onboarding" replace />;
  }

  if (allowOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}> 
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowOnboarding>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
