import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import "./AssetsPage.css";
import SummaryCards from "./cards/SummaryCards";
import AllocationCard from "./cards/AllocationCard";
import InvestmentsCard from "./cards/InvestmentsCard";
import GoldDetailsCard from "./cards/GoldDetailsCard";
import InsuranceCard from "./cards/InsuranceCard";
import InsurancePoliciesModal from "./cards/InsurancePoliciesModal";
import InvestmentsDetailsModal from "./cards/InvestmentsDetailsModal";
import AddInvestmentModal from "./cards/AddInvestmentModal";
import AddMetalModal from "./cards/AddMetalModal";
import { addInvestment, addMetalHolding } from "../../../lib/api/assets.api";
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
  const queryClient = useQueryClient();
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentError, setInvestmentError] = useState("");
  const [isInvestmentSubmitting, setIsInvestmentSubmitting] = useState(false);
  const [isMetalModalOpen, setIsMetalModalOpen] = useState(false);
  const [metalError, setMetalError] = useState("");
  const [isMetalSubmitting, setIsMetalSubmitting] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isInvestmentsModalOpen, setIsInvestmentsModalOpen] = useState(false);

  const {
    isLoading,
    isError,
    totals,
    currencies,
    allocation,
    metalHoldings,
    metalTypesCount,
    insurancePoliciesCovered,
  } = useAssetsData(user?.id);

  const handleAddInvestment = () => {
    setInvestmentError("");
    setIsInvestmentModalOpen(true);
  };

  const handleOpenInvestmentsModal = () => {
    setIsInvestmentsModalOpen(true);
  };

  const handleCloseInvestmentsModal = () => {
    setIsInvestmentsModalOpen(false);
  };

  const handleAddMetal = () => {
    setMetalError("");
    setIsMetalModalOpen(true);
  };

  const handleOpenInsuranceModal = () => {
    setIsInsuranceModalOpen(true);
  };

  const handleCloseInsuranceModal = () => {
    setIsInsuranceModalOpen(false);
  };

  const handleCloseInvestmentModal = () => {
    setInvestmentError("");
    setIsInvestmentModalOpen(false);
  };

  const handleSubmitInvestment = async (payload) => {
    setInvestmentError("");
    setIsInvestmentSubmitting(true);
    try {
      await addInvestment(payload);
      queryClient.invalidateQueries({ queryKey: ["investments-total"] });
      queryClient.invalidateQueries({ queryKey: ["investments-details"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
      setIsInvestmentModalOpen(false);
    } catch (err) {
      setInvestmentError(err?.message || "Unable to add investment.");
    } finally {
      setIsInvestmentSubmitting(false);
    }
  };

  const handleCloseMetalModal = () => {
    setMetalError("");
    setIsMetalModalOpen(false);
  };

  const handleSubmitMetal = async (payload) => {
    setMetalError("");
    setIsMetalSubmitting(true);
    try {
      await addMetalHolding(payload);
      queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
      setIsMetalModalOpen(false);
    } catch (err) {
      setMetalError(err?.message || "Unable to add metal holding.");
    } finally {
      setIsMetalSubmitting(false);
    }
  };

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
            Track long-term allocations like investments, metals, and insurance.
          </p>
        </div>

        <span className="assets-page-updated">Synced from Supabase views</span>
      </div>

      <SummaryCards
        totalAssets={totals.assets}
        investmentsTotal={totals.investments}
        insuranceTotal={totals.insurance}
        insurancePoliciesCovered={insurancePoliciesCovered}
        assetsCurrency={currencies.assets}
        investmentsCurrency={currencies.investments}
        insuranceCurrency={currencies.insurance}
        metalTypeCount={metalTypesCount}
      />

      <div className="assets-page-grid">
        <AllocationCard allocation={allocation} totalAssets={totals.assets} currency={currencies.assets} />
        <InvestmentsCard
          total={totals.investments}
          currency={currencies.investments || currencies.assets}
          onAdd={handleAddInvestment}
          onViewMore={handleOpenInvestmentsModal}
        />
        <GoldDetailsCard metalHoldings={metalHoldings} onAdd={handleAddMetal} />
        <InsuranceCard
          totalPremiums={totals.insurance}
          currency={currencies.insurance || currencies.assets}
          policiesCount={insurancePoliciesCovered}
          onViewHistory={handleOpenInsuranceModal}
        />
      </div>

      <AddInvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={handleCloseInvestmentModal}
        onSubmit={handleSubmitInvestment}
        isSubmitting={isInvestmentSubmitting}
        errorMessage={investmentError}
      />

      <AddMetalModal
        isOpen={isMetalModalOpen}
        onClose={handleCloseMetalModal}
        onSubmit={handleSubmitMetal}
        isSubmitting={isMetalSubmitting}
        errorMessage={metalError}
      />

      <InsurancePoliciesModal
        isOpen={isInsuranceModalOpen}
        onClose={handleCloseInsuranceModal}
        currency={currencies.insurance || currencies.assets}
      />

      <InvestmentsDetailsModal
        isOpen={isInvestmentsModalOpen}
        onClose={handleCloseInvestmentsModal}
        currency={currencies.investments || currencies.assets}
      />
    </div>
  );
}
