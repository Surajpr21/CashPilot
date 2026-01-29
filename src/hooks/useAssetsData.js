import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  getAssetsSummary,
  getMetalSummary,
  getInsuranceSummary,
  getInvestmentsTotal,
} from "../lib/api/assets.api";

export const assetsQueryKeys = {
  assetsTotal: (userId) => ["assets-total", userId],
  investmentsTotal: (userId) => ["investments-total", userId],
  metalsSummary: (userId) => ["metals-summary", userId],
  insuranceSummary: (userId) => ["insurance-summary", userId],
};

const safeNumber = (value) => (value ?? 0);

export function useAssetsData(userId) {
  const results = useQueries({
    queries: [
      {
        queryKey: assetsQueryKeys.assetsTotal(userId),
        queryFn: () => getAssetsSummary(),
        enabled: Boolean(userId),
      },
      {
        queryKey: assetsQueryKeys.investmentsTotal(userId),
        queryFn: () => getInvestmentsTotal(),
        enabled: Boolean(userId),
      },
      {
        queryKey: assetsQueryKeys.metalsSummary(userId),
        queryFn: () => getMetalSummary(),
        enabled: Boolean(userId),
      },
      {
        queryKey: assetsQueryKeys.insuranceSummary(userId),
        queryFn: () => getInsuranceSummary(),
        enabled: Boolean(userId),
      },
    ],
  });

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);

  return useMemo(() => {
    const assetsSummary = results[0]?.data ?? null;
    const investmentsSummary = results[1]?.data ?? null;
    const metalsSummary = results[2]?.data ?? [];
    const insuranceSummary = results[3]?.data ?? null;

    const totals = {
      assets: safeNumber(assetsSummary?.total_assets),
      investments: safeNumber(investmentsSummary?.total_invested),
      insurance: safeNumber(insuranceSummary?.total_premiums),
    };

    const currencies = {
      assets: assetsSummary?.currency ?? null,
      investments: investmentsSummary?.currency ?? assetsSummary?.currency ?? null,
      insurance: insuranceSummary?.currency ?? assetsSummary?.currency ?? null,
    };

    const allocation = [
      { name: "Investments", value: totals.investments },
      { name: "Insurance", value: totals.insurance },
    ];

    const metalHoldings = Array.isArray(metalsSummary) ? metalsSummary : [];
    const metalTypesCount = metalHoldings.length;

    return {
      isLoading,
      isError,
      totals,
      currencies,
      allocation,
      metalHoldings,
      metalTypesCount,
      insurancePoliciesCovered: safeNumber(insuranceSummary?.policies_covered),
    };
  }, [isError, isLoading, results]);
}

export function invalidateAssetsQueries(queryClient, userId) {
  queryClient.invalidateQueries({ queryKey: ["assets-total"] });
  queryClient.invalidateQueries({ queryKey: ["investments-total"] });
  queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
  queryClient.invalidateQueries({ queryKey: ["insurance-summary"] });
  queryClient.invalidateQueries({ queryKey: ["insurance-policies-summary"] });
}
