import React, { useEffect, useMemo, useState } from "react";
import { addExpense } from "../../../../../services/expenses.service";
import { upsertIncomeTransaction } from "../../../../../services/transactions.service";
import { supabase } from "../../../../../lib/supabaseClient";
import { CATEGORIES } from "../../../../../constants/categories";
import {
  addInsurancePremium,
  createInsurancePolicy,
  getInsurancePolicies,
} from "../../../../../lib/api/assets.api";
import { INSURANCE_TYPES } from "../../../../../constants/insuranceTypes";
import "./ExpenseForm.css";

const initialState = {
  spent_at: "",
  title: "",
  category: "",
  amount: "",
  payment_mode: "",
  currency: "INR",
  // Insurance-only fields
  insuranceProvider: "",
  policyName: "",
  insuranceType: "",
  policyId: "",
};

export default function ExpenseForm({ onClose, onExpenseAdded, mode = "expense" }) {
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policyMode, setPolicyMode] = useState("existing");
  const isIncome = mode === "income";

  const incomeCategories = useMemo(
    () => [
      "Salary",
      "Bonus",
      "Interest",
      "Dividends",
      "Rental",
      "Gifts",
      "Refunds",
      "Other",
    ],
    []
  );

  const disallowed = useMemo(
    () => ["Gold", "Investment", "Investments", "RD", "FD", "SIP", "Mutual Fund", "Stocks", "Equity", "Asset"],
    []
  );
  const expenseCategories = useMemo(
    () => CATEGORIES.filter((category) => !disallowed.includes(category)),
    [disallowed]
  );

  const isInsuranceCategory = useMemo(
    () => !isIncome && (formState.category || "").toLowerCase() === "insurance",
    [formState.category, isIncome]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isIncome || !isInsuranceCategory) {
      setPolicyMode("existing");
      setFormState((prev) => ({
        ...prev,
        policyId: "",
        insuranceProvider: "",
        policyName: "",
        insuranceType: "",
        currency: prev.currency || "INR",
      }));
      return;
    }

    let active = true;
    setPoliciesLoading(true);

    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const list = await getInsurancePolicies();
        if (active) setPolicies(list);
      } catch (err) {
        if (active) setError(err.message || "Failed to load policies");
      } finally {
        if (active) setPoliciesLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isInsuranceCategory, isIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to add entries");
        setLoading(false);
        return;
      }

      if (isIncome) {
        const incomePayload = {
          user_id: user.id,
          occurred_on: formState.spent_at,
          amount: formState.amount ? Number(formState.amount) : 0,
          category: formState.category || null,
          note: formState.title || null,
        };

        await upsertIncomeTransaction(incomePayload);
        setSuccess("Income added successfully");
      } else {
        const isInsurance = isInsuranceCategory;

        const expensePayload = {
          spent_at: formState.spent_at,
          title: formState.title,
          category: formState.category,
          amount: formState.amount ? Number(formState.amount) : "",
          sub_category: null,
          payment_mode: formState.payment_mode,
          user_id: user.id,
        };

        const { error: submitError } = await addExpense(expensePayload);
        if (submitError) throw submitError;

        if (isInsurance) {
          let policyId = formState.policyId;

          if (policyMode === "new") {
            if (!formState.insuranceProvider || !formState.policyName || !formState.insuranceType) {
              throw new Error("Insurance provider, policy name, and type are required");
            }

            const createdPolicy = await createInsurancePolicy({
              provider: formState.insuranceProvider,
              policy_name: formState.policyName,
              insurance_type: formState.insuranceType,
            });

            policyId = createdPolicy?.id;
          } else if (!policyId) {
            throw new Error("Select an existing policy or add a new one");
          }

          const insurancePayload = {
            policy_id: policyId,
            amount: Number(formState.amount) || 0,
            paid_on: formState.spent_at,
            currency: formState.currency || "INR",
          };

          await addInsurancePremium(insurancePayload);
        }

        setSuccess("Expense added successfully");
      }

      setFormState(initialState);
      if (onExpenseAdded) {
        onExpenseAdded();
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="expense-form-header">
        <h3>{isIncome ? "Add Income" : "Add Expense"}</h3>
        {onClose && (
          <button
            type="button"
            className="expense-form-close"
            aria-label="Close"
            onClick={onClose}
          >
            
          </button>
        )}
      </div>

      {!isIncome && (
        <div className="expense-form-grid">
          <label className="expense-form-field">
            <span>Date</span>
            <input
              type="date"
              name="spent_at"
              value={formState.spent_at}
              onChange={handleChange}
              required
            />
          </label>

          <label className="expense-form-field">
            <span>Title / Note</span>
            <input
              type="text"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Groceries at market"
              required
            />
          </label>

          <label className="expense-form-field">
            <span>Category</span>
            <select
              name="category"
              value={formState.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="expense-form-helper">Buying gold, RD/FD/SIP, or investing? Add it from Assets, not here.</p>
          </label>

          <label className="expense-form-field">
            <span>Amount</span>
            <input
              type="number"
              name="amount"
              value={formState.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </label>

          {isInsuranceCategory && (
            <label className="expense-form-field">
              <span>Currency</span>
              <input
                type="text"
                name="currency"
                value={formState.currency}
                onChange={handleChange}
                placeholder="INR"
              />
            </label>
          )}

          <label className="expense-form-field">
            <span>Mode of Payment</span>
            <select
              name="payment_mode"
              value={formState.payment_mode}
              onChange={handleChange}
              required
            >
              <option value="">Select mode</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
      )}

      {isIncome && (
        <div className="expense-form-grid">
          <label className="expense-form-field">
            <span>Date</span>
            <input
              type="date"
              name="spent_at"
              value={formState.spent_at}
              onChange={handleChange}
              required
            />
          </label>

          <label className="expense-form-field">
            <span>Category</span>
            <select
              name="category"
              value={formState.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {incomeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="expense-form-field">
            <span>Amount</span>
            <input
              type="number"
              name="amount"
              value={formState.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </label>
        </div>
      )}

      {!isIncome && isInsuranceCategory && (
        <div className="expense-form-insurance">
          <h4>Insurance details</h4>

          <div className="expense-form-grid">
            <label className="expense-form-field">
              <span>Existing policy</span>
              <select
                name="policyId"
                value={formState.policyId}
                onChange={(e) => {
                  setPolicyMode("existing");
                  setFormState((prev) => ({ ...prev, policyId: e.target.value }));
                }}
                disabled={policyMode === "new"}
              >
                <option value="">Select policy</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.provider || "Unknown provider"} — {policy.policy_name || "Untitled policy"}
                  </option>
                ))}
              </select>
              {policiesLoading && <p className="expense-form-helper">Loading your policies...</p>}
            </label>

            <div className="expense-form-field">
              <span>Need a new policy?</span>
              {policyMode === "new" ? (
                <button
                  type="button"
                  className="expense-form-toggle"
                  onClick={() => {
                    setPolicyMode("existing");
                    setFormState((prev) => ({ ...prev, insuranceProvider: "", policyName: "", insuranceType: "" }));
                  }}
                >
                  Use existing policy
                </button>
              ) : (
                <button
                  type="button"
                  className="expense-form-toggle"
                  onClick={() => {
                    setPolicyMode("new");
                    setFormState((prev) => ({ ...prev, policyId: "" }));
                  }}
                >
                  Add new policy
                </button>
              )}
            </div>
          </div>

          {policyMode === "new" && (
            <div className="expense-form-grid">
              <label className="expense-form-field">
                <span>Insurance Provider</span>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={formState.insuranceProvider}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Ergo"
                  required
                />
              </label>

              <label className="expense-form-field">
                <span>Policy Name</span>
                <input
                  type="text"
                  name="policyName"
                  value={formState.policyName}
                  onChange={handleChange}
                  placeholder="e.g. Family Floater 2025"
                  required
                />
              </label>

              <label className="expense-form-field">
                <span>Insurance Type</span>
                <select
                  name="insuranceType"
                  value={formState.insuranceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  {INSURANCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="expense-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : isIncome ? "Save Income" : "Save Expense"}
        </button>
      </div>

      {error && <div className="expense-form-error">{error}</div>}
      {success && <div className="expense-form-success">{success}</div>}
    </form>
  );
}
