import React from "react";
import "./Dashboard.css";

import DashboardHeader from "../Dashboard/DashboardHeader/DashboardHeader";
import StatsCards from "../Dashboard/StatsCard/StatsCards";
import MonthlyExpensesChart from "../Dashboard/MonthlyExpense/MonthlyExpensesChart";
import TopCategoryDonut from "../Dashboard/TopCategoryDonut/TopCategoryDonut";
import SubList from "../Dashboard/SubList/SubList";
import RecentTransactions from "../Dashboard/RecentTransactions/RecentTransactions";
import BudgetVsActual from "../Dashboard/BudgetVsActual/BudgetVsActual";
import Insights from "../Dashboard/Insights/Insights";
import Goals from "../Dashboard/Goals/Goals";

const Dashboard = () => {
  return (
    <>
      <DashboardHeader />

      <div className="dashboard-stats">
        <StatsCards />
      </div>

      <div className="dashboard-charts-row">
        <MonthlyExpensesChart />
        <TopCategoryDonut />
      </div>

      <div className="dashboard-charts-row-2">
        <SubList />
        <RecentTransactions />
      </div>

      <div className="dashboard-charts-row-3">
        <BudgetVsActual />
        <Goals />
        <Insights />
      </div>
    </>
  );
};

export default Dashboard;
