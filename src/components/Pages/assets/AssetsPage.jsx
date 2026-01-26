import React from "react";
import "./AssetsPage.css";
import SummaryCards from "./cards/SummaryCards";
import AllocationCard from "./cards/AllocationCard";
import InvestmentsCard from "./cards/InvestmentsCard";
import GoldDetailsCard from "./cards/GoldDetailsCard";
import InsuranceCard from "./cards/InsuranceCard";
import { useAssetsData } from "../../../hooks/useAssetsData";
import { useAuthUser } from "../../../contexts/AuthContext";

function PageLoader({ message = "Loading assets..." }) {
  return (
    <div className="assets-page-container">
      <p>{message}</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="assets-page-container">
      <p>Unable to load assets right now. Please try again.</p>
    </div>
  );
}

export default function AssetsPage() {
  const user = useAuthUser();
  const { isLoading, isError, totals, currencies, allocation, goldMarket } = useAssetsData(user?.id);
  const handleAddGold = () => {};
  const handleAddInvestment = () => {};

  if (!user) {
    return <PageLoader message="Authenticating..." />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <ErrorState />;
  }

  return (
    <div className="assets-page-container">
      <div className="assets-page-header">
        <div>
          <h1 className="assets-page-title">Assets</h1>
          <p className="assets-page-subtitle">
            Track long-term allocations like investments, gold, and insurance.
          </p>
        </div>

        <span className="assets-page-updated">Synced from Supabase views</span>
      </div>

      <SummaryCards
        totalAssets={totals.assets}
        investmentsTotal={totals.investments}
        goldValue={totals.gold}
        goldGrams={totals.goldGrams}
        insuranceTotal={totals.insurance}
        assetsCurrency={currencies.assets}
        investmentsCurrency={currencies.investments}
        goldCurrency={currencies.gold}
        insuranceCurrency={currencies.insurance}
        goldMarketPricePerGram={goldMarket.pricePerGram}
        goldMarketCurrency={goldMarket.currency}
      />

      <div className="assets-page-grid">
        <AllocationCard allocation={allocation} totalAssets={totals.assets} currency={currencies.assets} />
        <InvestmentsCard
          total={totals.investments}
          currency={currencies.investments || currencies.assets}
          onAdd={handleAddInvestment}
        />
        <GoldDetailsCard
          totalGrams={totals.goldGrams}
          totalValue={totals.gold}
          averageBuyPrice={totals.goldAvgBuyPrice}
          currency={currencies.gold || currencies.assets}
          marketPricePerGram={goldMarket.pricePerGram}
          marketCurrency={goldMarket.currency || currencies.gold || currencies.assets}
          onAdd={handleAddGold}
        />
        <InsuranceCard
          totalPremiums={totals.insurance}
          currency={currencies.insurance || currencies.assets}
        />
      </div>
    </div>
  );
}
