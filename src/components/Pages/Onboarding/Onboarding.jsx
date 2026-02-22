import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { seedIncomeTransaction } from "../../../services/transactions.service";
import { AVATAR_PRESETS } from "../../../constants/avatars";
import "./Onboarding.css";

export default function Onboarding() {
  const { profile, financial, setProfile, setFinancial, session } = useAuth();
  const navigate = useNavigate();

  const initialForm = useMemo(() => ({
    full_name: profile?.full_name ? String(profile.full_name) : "",
    opening_balance: financial?.opening_balance ? String(financial.opening_balance) : "",
    monthly_income: financial?.monthly_income ? String(financial.monthly_income) : "",
    tracking_start_date: financial?.tracking_start_date ? financial.tracking_start_date : "",
    avatar_url: profile?.avatar_url ? String(profile.avatar_url) : "",
  }), [financial, profile]);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState("");

  useEffect(() => {
    setForm(initialForm);
    setPendingAvatar(initialForm.avatar_url || "");
  }, [initialForm]);

  if (!profile || !financial) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const isFirstOnboarding = !financial?.onboarding_completed;

    const name = form.full_name.trim();
    if (!name) {
      setError("Name is required");
      return;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

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
      const userId = session?.user?.id || profile?.id;
      if (!userId) throw new Error("Missing user session");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: name, avatar_url: form.avatar_url })
        .eq("id", userId);

      if (profileError) throw profileError;

      const { error: financialError } = await supabase
        .from("financial_settings")
        .update({
          onboarding_completed: true,
          opening_balance: openingBalanceNumber,
          monthly_income: monthlyIncomeNumber,
          tracking_start_date: form.tracking_start_date || null,
        })
        .eq("user_id", userId);

      if (financialError) throw financialError;

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

      setProfile(prev => ({
        ...(prev || {}),
        id: userId,
        full_name: name,
        avatar_url: form.avatar_url,
      }));
      setFinancial(prev => ({
        ...(prev || {}),
        onboarding_completed: true,
        opening_balance: openingBalanceNumber,
        monthly_income: monthlyIncomeNumber,
        tracking_start_date: form.tracking_start_date || null,
      }));
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
            <span>Name *</span>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your name"
              minLength={2}
              required
            />
          </label>

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

          <div className="onboarding-field">
            <span>Avatar *</span>
            <div className="onboarding-avatar-row">
              <button
                type="button"
                className="onboarding-avatar-button"
                onClick={() => {
                  setPendingAvatar(form.avatar_url || "");
                  setAvatarModalOpen(true);
                }}
              >
                Select Avatar
              </button>
              {form.avatar_url ? (
                <div className="onboarding-avatar-preview">
                  <img src={form.avatar_url} alt="Selected avatar" />
                  <span>Selected</span>
                </div>
              ) : (
                <span className="onboarding-avatar-placeholder">No avatar selected</span>
              )}
            </div>
          </div>

          <button type="submit" className="onboarding-submit" disabled={saving || !form.avatar_url}>
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </form>
      </div>

      {avatarModalOpen && (
        <div className="onboarding-modal-backdrop" role="dialog" aria-modal="true">
          <div className="onboarding-modal">
            <div className="onboarding-modal-header">
              <h3>Select an avatar</h3>
              <button className="onboarding-modal-close" type="button" onClick={() => setAvatarModalOpen(false)} aria-label="Close avatar picker">
                ×
              </button>
            </div>
            <div className="onboarding-avatar-grid">
              {AVATAR_PRESETS.map((url) => {
                const isSelected = pendingAvatar === url;
                return (
                  <button
                    type="button"
                    key={url}
                    className={`onboarding-avatar-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => setPendingAvatar(url)}
                  >
                    <img src={url} alt="Avatar option" />
                  </button>
                );
              })}
            </div>
            <div className="onboarding-modal-actions">
              <button
                type="button"
                className="onboarding-avatar-confirm"
                onClick={() => {
                  if (!pendingAvatar) return;
                  setForm(prev => ({ ...prev, avatar_url: pendingAvatar }));
                  setAvatarModalOpen(false);
                }}
                disabled={!pendingAvatar}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
