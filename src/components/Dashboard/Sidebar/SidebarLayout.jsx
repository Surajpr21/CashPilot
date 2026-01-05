// import React, { useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "./Sidebar";

// const SidebarLayout = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
//   const location = useLocation();

//   const activeTab = location.pathname.split("/")[1] || "dashboard";

//   return (
//     <div className="app-layout">
//       <Sidebar
//         activeTab={activeTab}
//         isExpanded={isSidebarExpanded}
//         setIsExpanded={setIsSidebarExpanded}
//       />

//       <main className="app-content">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default SidebarLayout;
