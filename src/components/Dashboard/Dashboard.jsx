// import React, { useState } from "react";
// import "./Dashboard.css";
// import Sidebar from "../Dashboard/Sidebar/Sidebar";
// import DashboardHeader from "../Dashboard/DashboardHeader/DashboardHeader";
// import StatsCards from "../Dashboard/StatsCard/StatsCards";
// import MonthlyExpensesChart from "../Dashboard/MonthlyExpense/MonthlyExpensesChart";
// import TopCategoryDonut from "../Dashboard/TopCategoryDonut/TopCategoryDonut";
// import SubList from "../Dashboard/SubList/SubList";
// import RecentTransactions from "../Dashboard/RecentTransactions/RecentTransactions";
// import BudgetVsActual from "../Dashboard/BudgetVsActual/BudgetVsActual";
// import Insights from "../Dashboard/Insights/Insights";
// import Snowfall from "react-snowfall";
// import Goals from "../Dashboard/Goals/Goals";

// // use darkslategrey for darkmode bg

// const Dashboard = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

//   return (
//     <div className="dashboard-container">
//       <Snowfall
//         snowflakeCount={150}
//         color="rgba(150, 150, 150, 0.45)"
//         radius={[0.8, 1.6]}
//         speed={[0.3, 0.7]}
//         wind={[-0.1, 0.2]}
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* <div className="dashboard-bg-svg" aria-hidden>
//         <svg
//           width="100%"
//           height="100%"
//           viewBox="0 0 1440 590"
//           preserveAspectRatio="xMidYMid slice"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             d="M 0,600 L 0,337 C 69.81282051282051,327.224358974359 139.62564102564102,317.44871794871796 220,291 C 300.374358974359,264.55128205128204 391.31025641025644,221.42948717948718 475,207 C 558.6897435897436,192.57051282051282 635.1333333333333,206.83333333333334 717,194 C 798.8666666666667,181.16666666666666 886.1564102564103,141.2371794871795 978,105 C 1069.8435897435897,68.76282051282051 1166.2410256410258,36.217948717948715 1244,13 C 1321.7589743589742,-10.217948717948717 1380.8794871794871,-24.108974358974358 1440,-38 L 1440,600 L 0,600 Z"
//             fill="#ffffff"
//             fillOpacity="0.4"
//           />
//           <path
//             d="M 0,600 L 0,487 C 98.73333333333332,501.4166666666667 197.46666666666664,515.8333333333334 284,502 C 370.53333333333336,488.16666666666663 444.8666666666668,446.0833333333333 511,430 C 577.1333333333332,413.9166666666667 635.0666666666666,423.83333333333337 698,389 C 760.9333333333334,354.16666666666663 828.8666666666667,274.5833333333333 919,232 C 1009.1333333333333,189.41666666666669 1121.4666666666667,183.83333333333334 1212,170 C 1302.5333333333333,156.16666666666666 1371.2666666666667,134.08333333333331 1440,112 L 1440,600 L 0,600 Z"
//             fill="#ffffff"
//             fillOpacity="0.53"
//           />
//           <path
//             d="M 0,600 L 0,637 C 97.63846153846154,668.0807692307692 195.27692307692308,699.1615384615385 271,690 C 346.7230769230769,680.8384615384615 400.53076923076924,631.4346153846154 469,575 C 537.4692307692308,518.5653846153846 620.6,455.1 706,441 C 791.4,426.9 879.0692307692307,462.1653846153846 964,453 C 1048.9307692307693,443.8346153846154 1131.1230769230767,390.23846153846154 1210,351 C 1288.8769230769233,311.76153846153846 1364.4384615384615,286.88076923076926 1440,262 L 1440,600 L 0,600 Z"
//             fill="#ffffff"
//             fillOpacity="1"
//           />
//         </svg>
//       </div> */}

//       <Sidebar
//         activeTab="dashboard"
//         isExpanded={isSidebarExpanded}
//         setIsExpanded={setIsSidebarExpanded}
//       />
//       <div
//         className={`dashboard-content ${isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
//           }`}
//       >
//         <DashboardHeader />
//         <div className="dashboard-stats">
//           <StatsCards />
//         </div>

//         <div className="dashboard-charts-row">
//           <MonthlyExpensesChart />
//           <TopCategoryDonut />
//         </div>
//         <div className="dashboard-charts-row-2">
//           <SubList />
//           <RecentTransactions />
//         </div>
//         <div className="dashboard-charts-row-3">
//           <BudgetVsActual />
//           <Goals />
//           <Insights />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React, { useState } from "react";
// import "./Dashboard.css";

// import Sidebar from "../Dashboard/Sidebar/Sidebar";
// import DashboardHeader from "../Dashboard/DashboardHeader/DashboardHeader";
// import StatsCards from "../Dashboard/StatsCard/StatsCards";
// import MonthlyExpensesChart from "../Dashboard/MonthlyExpense/MonthlyExpensesChart";
// import TopCategoryDonut from "../Dashboard/TopCategoryDonut/TopCategoryDonut";
// import SubList from "../Dashboard/SubList/SubList";
// import RecentTransactions from "../Dashboard/RecentTransactions/RecentTransactions";
// import BudgetVsActual from "../Dashboard/BudgetVsActual/BudgetVsActual";
// import Insights from "../Dashboard/Insights/Insights";
// import Goals from "../Dashboard/Goals/Goals";

// import Snowfall from "react-snowfall";

// const Dashboard = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

//   return (
//     <div className="dashboard-container">
//       <Snowfall
//         snowflakeCount={150}
//         color="rgba(150,150,150,0.45)"
//         radius={[0.8, 1.6]}
//         speed={[0.3, 0.7]}
//         wind={[-0.1, 0.2]}
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* NAVBAR / TOPBAR — BACK HERE */}
//       <Sidebar
//         activeTab="dashboard"
//         isExpanded={isSidebarExpanded}
//         setIsExpanded={setIsSidebarExpanded}
//       />

//       <div
//         className={`dashboard-content ${
//           isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
//         }`}
//       >
//         <DashboardHeader />

//         <div className="dashboard-stats">
//           <StatsCards />
//         </div>

//         <div className="dashboard-charts-row">
//           <MonthlyExpensesChart />
//           <TopCategoryDonut />
//         </div>

//         <div className="dashboard-charts-row-2">
//           <SubList />
//           <RecentTransactions />
//         </div>

//         <div className="dashboard-charts-row-3">
//           <BudgetVsActual />
//           <Goals />
//           <Insights />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from "react";
import "./Dashboard.css";

import Sidebar from "../Dashboard/Sidebar/Sidebar";
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
