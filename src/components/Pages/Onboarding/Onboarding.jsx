import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { seedIncomeTransaction } from "../../../services/transactions.service";
import "./Onboarding.css";

export default function Onboarding() {
  const { profile, persistProfile, setProfile, session } = useAuth();
  const navigate = useNavigate();

  const initialForm = useMemo(() => ({
    opening_balance: profile?.opening_balance ? String(profile.opening_balance) : "",
    monthly_income: profile?.monthly_income ? String(profile.monthly_income) : "",
    tracking_start_date: profile?.tracking_start_date ? profile.tracking_start_date : "",
  }), [profile]);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  if (!profile) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const isFirstOnboarding = !profile?.onboarding_completed;

    if (!form.opening_balance.trim()) {
      setError("Opening balance is required");
      return;
    }

    const openingBalanceNumber = Number(form.opening_balance);
    if (Number.isNaN(openingBalanceNumber)) {
      setError("Opening balance must be a number");
      return;
    }

    const monthlyIncomeNumber = form.monthly_income.trim() ? Number(form.monthly_income) : null;
    if (form.monthly_income.trim() && Number.isNaN(monthlyIncomeNumber)) {
      setError("Monthly income must be a number");
      return;
    }

    setSaving(true);

    try {
      const updated = await persistProfile({
        onboarding_completed: true,
        opening_balance: openingBalanceNumber,
        monthly_income: monthlyIncomeNumber,
        tracking_start_date: form.tracking_start_date || null,
      });

      const userId = session?.user?.id || updated?.id || profile?.id;
      if (isFirstOnboarding && monthlyIncomeNumber && userId) {
        const occurredOn = form.tracking_start_date || new Date().toISOString().split("T")[0];
        try {
          await seedIncomeTransaction({
            userId,
            amount: monthlyIncomeNumber,
            occurredOn,
            note: "Onboarding income seed",
          });
        } catch (txErr) {
          console.error("Failed to seed onboarding income transaction", txErr);
        }
      }

      setProfile(updated);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save onboarding";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <p className="onboarding-kicker">Welcome to CashPilot</p>
          <h1>Finish onboarding</h1>
          <p className="onboarding-subtext">Tell us a few details so we can personalize your dashboard.</p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <label className="onboarding-field">
            <span>Opening balance *</span>
            <input
              name="opening_balance"
              type="number"
              min="0"
              step="0.01"
              value={form.opening_balance}
              onChange={handleChange}
              placeholder="Enter your current balance"
              required
            />
          </label>

          <label className="onboarding-field">
            <span>Monthly income (optional)</span>
            <input
              name="monthly_income"
              type="number"
              min="0"
              step="0.01"
              value={form.monthly_income}
              onChange={handleChange}
              placeholder="What do you take home each month?"
            />
          </label>

          <label className="onboarding-field">
            <span>Tracking start date (optional)</span>
            <input
              name="tracking_start_date"
              type="date"
              value={form.tracking_start_date ?? ""}
              onChange={handleChange}
            />
          </label>

          <button type="submit" className="onboarding-submit" disabled={saving}>
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
