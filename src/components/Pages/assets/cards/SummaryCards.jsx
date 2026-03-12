import React from "react";
import "./SummaryCards.css";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet02Icon,
  MoneyBag02Icon,
  SparklesIcon,
  RupeeShieldIcon,
} from "@hugeicons/core-free-icons";

const ICON_GRADIENT_FALLBACKS = {
  assets: "#2563eb",
  investments: "#10b981",
  metals: "#f59e0b",
  insurance: "#ef4444",
};

export default function SummaryCards({
  totalAssets,
  investmentsTotal,
  insuranceTotal,
  insurancePoliciesCovered,
  assetsCurrency,
  investmentsCurrency,
  insuranceCurrency,
  metalTypeCount,
}) {
  return (
    <div className="assets-page-summary">
      <svg className="assets-page-summary-gradient-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="assets-page-summary-gradient-assets" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="assets-page-summary-gradient-investments" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="assets-page-summary-gradient-metals" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="assets-page-summary-gradient-insurance" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-assets" aria-hidden="true">
            <HugeiconsIcon
              icon={Wallet02Icon}
              size={28}
              strokeWidth={1.8}
              color={ICON_GRADIENT_FALLBACKS.assets}
            />
          </span>
          <p>Total Assets</p>
        </div>
        <h2>₹ {formatCurrency(totalAssets)}</h2>
        <span>Across investments & insurance.</span>
        <svg
          className="assets-page-summary-card-wave assets-page-summary-card-wave-assets"
          viewBox="0 0 320 72"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0,68 L18,62 L36,66 L54,52 L72,58 L90,44 L108,50 L126,38 L144,46 L162,34 L180,42 L198,30 L216,40 L234,28 L252,36 L270,26 L288,34 L306,22 L320,26 L320,72 L0,72 Z" />
        </svg>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-investments" aria-hidden="true">
            <HugeiconsIcon
              icon={MoneyBag02Icon}
              size={28}
              strokeWidth={1.8}
              color={ICON_GRADIENT_FALLBACKS.investments}
            />
          </span>
          <p>Invested Amount</p>
        </div>
        <h2>₹ {formatCurrency(investmentsTotal)}</h2>
        <span>Long-term investments (Excludes gold & insurance)</span>
        <svg
          className="assets-page-summary-card-wave assets-page-summary-card-wave-investments"
          viewBox="0 0 320 72"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0,68 L18,62 L36,66 L54,52 L72,58 L90,44 L108,50 L126,38 L144,46 L162,34 L180,42 L198,30 L216,40 L234,28 L252,36 L270,26 L288,34 L306,22 L320,26 L320,72 L0,72 Z" />
        </svg>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-metals" aria-hidden="true">
            <HugeiconsIcon
              icon={SparklesIcon}
              size={28}
              strokeWidth={1.8}
              color={ICON_GRADIENT_FALLBACKS.metals}
            />
          </span>
          <p>Precious Metals</p>
        </div>
        <h2>{formatNumber(metalTypeCount)} types</h2>
        <small>Quantity-based assets</small>
        <svg
          className="assets-page-summary-card-wave assets-page-summary-card-wave-metals"
          viewBox="0 0 320 72"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0,68 L18,62 L36,66 L54,52 L72,58 L90,44 L108,50 L126,38 L144,46 L162,34 L180,42 L198,30 L216,40 L234,28 L252,36 L270,26 L288,34 L306,22 L320,26 L320,72 L0,72 Z" />
        </svg>
      </div>

      <div className="assets-page-summary-card">
        <div className="assets-page-summary-card-header">
          <span className="assets-page-summary-icon assets-page-summary-icon-insurance" aria-hidden="true">
            <HugeiconsIcon
              icon={RupeeShieldIcon}
              size={28}
              strokeWidth={1.8}
              color={ICON_GRADIENT_FALLBACKS.insurance}
            />
          </span>
          <p>Insurance Premiums Paid</p>
        </div>
        <h2>₹ {formatCurrency(insuranceTotal)}</h2>
        <span>Policies covered: {formatNumber(insurancePoliciesCovered)}</span>
        <svg
          className="assets-page-summary-card-wave assets-page-summary-card-wave-insurance"
          viewBox="0 0 320 72"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0,68 L18,62 L36,66 L54,52 L72,58 L90,44 L108,50 L126,38 L144,46 L162,34 L180,42 L198,30 L216,40 L234,28 L252,36 L270,26 L288,34 L306,22 L320,26 L320,72 L0,72 Z" />
        </svg>
      </div>
    </div>
  );
}
