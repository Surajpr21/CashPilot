import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import { seedIncomeTransaction } from "../../../services/transactions.service";
import "./Onboarding.css";

type FormState = {
	full_name: string;
	opening_balance: string;
	monthly_income: string;
	tracking_start_date: string;
};

export default function Onboarding() {
	const { profile, financial, setProfile, setFinancial, session } = useAuth();
	const navigate = useNavigate();
	const initialForm = useMemo<FormState>(() => ({
		full_name: profile?.full_name ? String(profile.full_name) : "",
		opening_balance: financial?.opening_balance ? String(financial.opening_balance) : "",
		monthly_income: financial?.monthly_income ? String(financial.monthly_income) : "",
		tracking_start_date: financial?.tracking_start_date ? financial.tracking_start_date : "",
	}), [financial, profile]);

	const [form, setForm] = useState<FormState>(initialForm);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		setForm(initialForm);
	}, [initialForm]);

	if (!profile || !financial) return null;

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
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
				.update({ full_name: name })
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

					<button type="submit" className="onboarding-submit" disabled={saving}>
						{saving ? "Saving..." : "Save and continue"}
					</button>
				</form>
			</div>
		</div>
	);
}
