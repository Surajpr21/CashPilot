import React from "react";
import "./AssetsPage.css";

import SummaryCards from "./cards/SummaryCards";
import AllocationCard from "./cards/AllocationCard";
import InvestmentsCard from "./cards/InvestmentsCard";
import GoldDetailsCard from "./cards/GoldDetailsCard";
import InsuranceCard from "./cards/InsuranceCard";

export default function AssetsPage() {
  return (
    <div className="assets-page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Assets</h1>
          <p className="assets-page-subtitle">
            Track long-term allocations like investments, gold, and insurance.
          </p>
        </div>

        <span className="assets-page-updated">Last updated today •</span>
      </div>

      <SummaryCards />

      <div className="assets-page-grid">
        <AllocationCard />
        <InvestmentsCard />
        <GoldDetailsCard />
        <InsuranceCard />
      </div>
    </div>
  );
}
