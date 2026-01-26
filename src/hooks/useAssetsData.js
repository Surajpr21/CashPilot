import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  getAssetsSummary,
  getGoldSummary,
  getInsuranceTotal,
  getInvestmentsTotal,
  getLatestGoldMarketPrice,
} from "../lib/api/assets.api";

export const assetsQueryKeys = {
  assetsTotal: (userId) => ["assets-total", userId],
  investmentsTotal: (userId) => ["investments-total", userId],
  goldSummary: (userId) => ["gold-summary", userId],
  insuranceTotal: (userId) => ["insurance-total", userId],
  goldMarketPrice: ["gold-market-price"],
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
        queryKey: assetsQueryKeys.goldSummary(userId),
        queryFn: () => getGoldSummary(),
        enabled: Boolean(userId),
      },
      {
        queryKey: assetsQueryKeys.insuranceTotal(userId),
        queryFn: () => getInsuranceTotal(),
        enabled: Boolean(userId),
      },
      {
        queryKey: assetsQueryKeys.goldMarketPrice,
        queryFn: () => getLatestGoldMarketPrice(),
      },
    ],
  });

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);

  return useMemo(() => {
    const assetsSummary = results[0]?.data ?? null;
    const investmentsSummary = results[1]?.data ?? null;
    const goldSummary = results[2]?.data ?? null;
    const insuranceSummary = results[3]?.data ?? null;
    const goldMarketPrice = results[4]?.data ?? null;

    const totals = {
      assets: safeNumber(assetsSummary?.total_assets),
      investments: safeNumber(investmentsSummary?.total_invested),
      gold: safeNumber(goldSummary?.total_value),
      goldGrams: safeNumber(goldSummary?.total_grams),
      goldAvgBuyPrice: safeNumber(goldSummary?.avg_buy_price),
      insurance: safeNumber(insuranceSummary?.total_premiums),
    };

    const currencies = {
      assets: assetsSummary?.currency ?? null,
      investments: investmentsSummary?.currency ?? assetsSummary?.currency ?? null,
      gold: goldSummary?.currency ?? investmentsSummary?.currency ?? assetsSummary?.currency ?? null,
      insurance: insuranceSummary?.currency ?? assetsSummary?.currency ?? null,
      goldMarket: goldMarketPrice?.currency ?? goldSummary?.currency ?? null,
    };

    const allocation = [
      { name: "Investments", value: totals.investments },
      { name: "Gold", value: totals.gold },
      { name: "Insurance", value: totals.insurance },
    ];

    const goldMarket = {
      pricePerGram: safeNumber(goldMarketPrice?.price_per_gram),
      currency: currencies.goldMarket,
    };

    return {
      isLoading,
      isError,
      totals,
      currencies,
      allocation,
      goldMarket,
    };
  }, [isError, isLoading, results]);
}

export function invalidateAssetsQueries(queryClient, userId) {
  queryClient.invalidateQueries({ queryKey: ["assets-total"] });
  queryClient.invalidateQueries({ queryKey: ["investments-total"] });
  queryClient.invalidateQueries({ queryKey: ["gold-summary"] });
  queryClient.invalidateQueries({ queryKey: ["insurance-total"] });
  queryClient.invalidateQueries({ queryKey: assetsQueryKeys.goldMarketPrice });
}
