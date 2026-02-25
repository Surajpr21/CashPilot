import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addExpense, updateExpense } from "../../../../../services/expenses.service";
import { upsertIncomeTransaction } from "../../../../../services/transactions.service";
import { supabase } from "../../../../../lib/supabaseClient";
import { CATEGORIES } from "../../../../../constants/categories";
import {
  addInsurancePremium,
  createInsurancePolicy,
  getInsurancePolicies,
} from "../../../../../lib/api/assets.api";
import { INSURANCE_TYPES } from "../../../../../constants/insuranceTypes";
import CustomDropdown from "../../../../CustomDropdown/CustomDropdown";
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

export default function ExpenseForm({ onClose, onExpenseAdded, mode = "expense", initialData = null }) {
  const [formState, setFormState] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policyMode, setPolicyMode] = useState("existing");
  const [dateOpen, setDateOpen] = useState(false);
  const datePickerRef = useRef(null);
  const isIncome = mode === "income";
  const isEditing = Boolean(editingId);

  const policyOptions = useMemo(
    () => [
      { value: "", label: "Select policy" },
      ...policies.map((policy) => ({
        value: policy.id,
        label: `${policy.provider || "Unknown provider"} — ${policy.policy_name || "Untitled policy"}`,
      })),
    ],
    [policies]
  );

  const now = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => now.getMonth());
  const [viewYear, setViewYear] = useState(() => now.getFullYear());

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

  const paymentModeOptions = useMemo(
    () => [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
      { value: "upi", label: "UPI" },
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const insuranceTypeOptions = useMemo(
    () => [
      { value: "", label: "Select type" },
      ...INSURANCE_TYPES.map((type) => ({ value: type.value, label: type.label })),
    ],
    []
  );

  const isInsuranceCategory = useMemo(
    () => !isIncome && (formState.category || "").toLowerCase() === "insurance",
    [formState.category, isIncome]
  );

  const monthOptions = useMemo(
    () =>
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].map((label, idx) => ({ value: idx, label })),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    const start = Math.min(viewYear, currentYear) - 4;
    const end = Math.max(viewYear, currentYear) + 6;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((year) => ({
      value: year,
      label: String(year),
    }));
  }, [now, viewYear]);

  const weekDays = useMemo(() => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], []);

  const formatDate = useCallback((year, month, day) => {
    const normalized = new Date(year, month, day);
    const y = normalized.getFullYear();
    const m = normalized.getMonth();
    const d = normalized.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }, []);

  const todayString = useMemo(
    () => formatDate(now.getFullYear(), now.getMonth(), now.getDate()),
    [formatDate, now]
  );

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // start week on Monday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrevMonth - i;
      cells.push({
        day,
        monthOffset: -1,
        dateStr: formatDate(viewYear, viewMonth - 1, day),
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, monthOffset: 0, dateStr: formatDate(viewYear, viewMonth, day) });
    }

    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({
        day: nextDay,
        monthOffset: 1,
        dateStr: formatDate(viewYear, viewMonth + 1, nextDay),
      });
      nextDay += 1;
    }

    return cells;
  }, [viewMonth, viewYear, formatDate]);

  useEffect(() => {
    const parsed = formState.spent_at ? new Date(formState.spent_at) : null;
    const target = parsed && !Number.isNaN(parsed.getTime()) ? parsed : now;
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  }, [formState.spent_at, now]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!datePickerRef.current) return;

      const isInside = datePickerRef.current.contains(e.target);
      const isDropdownMenu = e.target.closest(".custom-dropdown-menu");

      if (!isInside && !isDropdownMenu) {
        setDateOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (initialData) {
      setEditingId(initialData.id || null);
      setFormState((prev) => ({
        ...prev,
        spent_at:
          initialData.spent_at ||
          initialData.occurred_on ||
          initialData.date ||
          prev.spent_at,
        title: initialData.title || initialData.note || "",
        category: initialData.category || "",
        amount: initialData.amount ? String(initialData.amount) : "",
        payment_mode: initialData.payment_mode || initialData.mode || "",
        currency: initialData.currency || "INR",
      }));
    } else {
      setEditingId(null);
      setFormState(initialState);
      setEditingId(null);
    }
  }, [initialData]);

  const handleMonthChange = (value) => setViewMonth(Number(value));
  const handleYearChange = (value) => setViewYear(Number(value));

  const handleMonthNav = (direction) => {
    const next = new Date(viewYear, viewMonth + direction, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const handleDaySelect = (dayInfo) => {
    const dateStr = formatDate(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    if (dateStr > todayString) return;

    setFormState((prev) => ({ ...prev, spent_at: dateStr }));

    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  const renderDatePicker = () => {
    const displayValue = formState.spent_at
      ? new Date(formState.spent_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select date";
    const isDatePlaceholder = !formState.spent_at;

    return (
      <label className="expense-form-field">
        <span>Date</span>
        <div className="expense-date-wrapper" ref={datePickerRef}>
          <button
            type="button"
            className={`date-picker-trigger ${dateOpen ? "open" : ""} ${isDatePlaceholder ? "placeholder" : ""}`}
            onClick={() => {
              setDateOpen((prev) => !prev);
            }}
            aria-expanded={dateOpen}
            aria-haspopup="dialog"
          >
            <span className={isDatePlaceholder ? "placeholder" : ""}>{displayValue}</span>
            <span className="date-picker-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M15 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </button>

          {dateOpen && (
            <div
              className="expense-date-popover"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="expense-date-picker">
                <div className="date-picker-header">
                  <button
                    type="button"
                    className="date-nav-btn"
                    aria-label="Previous month"
                    onClick={() => handleMonthNav(-1)}
                  >
                    {"<"}
                  </button>

                  <div className="date-picker-controls">
                    <CustomDropdown
                      width="140px"
                      value={viewMonth}
                      options={monthOptions}
                      onChange={handleMonthChange}
                      menuMaxHeight="240px"
                    />

                    <CustomDropdown
                      width="110px"
                      value={viewYear}
                      options={yearOptions}
                      onChange={handleYearChange}
                      menuMaxHeight="240px"
                    />
                  </div>

                  <button
                    type="button"
                    className="date-nav-btn"
                    aria-label="Next month"
                    onClick={() => handleMonthNav(1)}
                  >
                    {">"}
                  </button>
                </div>

                <div className="date-weekdays">
                  {weekDays.map((day) => (
                    <span key={day} className="date-weekday">
                      {day}
                    </span>
                  ))}
                </div>

                <div className="date-grid">
                  {calendarDays.map((day) => {
                    const isOutside = day.monthOffset !== 0;
                    const isSelected = formState.spent_at === day.dateStr;
                    const isToday = todayString === day.dateStr;
                    const isFuture = day.dateStr > todayString;

                    return (
                      <button
                        type="button"
                        key={day.dateStr}
                        className={`date-cell ${isOutside ? "outside" : ""} ${
                          isSelected ? "selected" : ""
                        } ${isToday ? "today" : ""} ${isFuture ? "future" : ""}`}
                        onClick={() => {
                          if (!isFuture) handleDaySelect(day);
                        }}
                        disabled={isFuture}
                        aria-label={`Select ${day.dateStr}`}
                        aria-pressed={isSelected}
                        aria-disabled={isFuture}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </label>
    );
  };

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

      if (!formState.spent_at) {
        setError("Please pick a date");
        setLoading(false);
        return;
      }

      if (formState.spent_at > todayString) {
        setError("Date cannot be in the future");
        setLoading(false);
        return;
      }

      if (isIncome) {
        if (!formState.category) {
          setError("Please select an income category");
          setLoading(false);
          return;
        }
      } else {
        if (!formState.category) {
          setError("Please select a category");
          setLoading(false);
          return;
        }
        if (!formState.payment_mode) {
          setError("Please select a payment mode");
          setLoading(false);
          return;
        }
      }

      if (isIncome) {
        const incomePayload = {
          id: editingId || undefined,
          user_id: user.id,
          occurred_on: formState.spent_at,
          amount: formState.amount ? Number(formState.amount) : 0,
          category: formState.category || null,
          note: formState.title || null,
        };

        await upsertIncomeTransaction(incomePayload);
        setSuccess(editingId ? "Income updated successfully" : "Income added successfully");
      } else {
        const isInsurance = isInsuranceCategory;

        const expensePayload = {
          id: editingId || undefined,
          spent_at: formState.spent_at,
          title: formState.title,
          category: formState.category,
          amount: formState.amount ? Number(formState.amount) : "",
          sub_category: null,
          payment_mode: formState.payment_mode,
          user_id: user.id,
        };

        if (editingId) {
          await updateExpense(expensePayload);
        } else {
          const { error: submitError } = await addExpense(expensePayload);
          if (submitError) throw submitError;
        }

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

        setSuccess(editingId ? "Expense updated successfully" : "Expense added successfully");
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
      </div>

      {!isIncome && (
        <div className="expense-form-grid">
          {renderDatePicker()}

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
            <CustomDropdown
              value={formState.category}
              options={expenseCategories.map((category) => ({ value: category, label: category }))}
              onChange={(val) => setFormState((prev) => ({ ...prev, category: val }))}
              placeholder="Select category"
              width="100%"
              menuMaxHeight="260px"
            />
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
            <CustomDropdown
              value={formState.payment_mode}
              options={paymentModeOptions}
              onChange={(val) => setFormState((prev) => ({ ...prev, payment_mode: val }))}
              placeholder="Select mode"
              width="100%"
              menuMaxHeight="100px"
            />
          </label>
        </div>
      )}

      {isIncome && (
        <div className="expense-form-grid">
          {renderDatePicker()}

          <label className="expense-form-field">
            <span>Category</span>
            <CustomDropdown
              value={formState.category}
              options={incomeCategories.map((cat) => ({ value: cat, label: cat }))}
              onChange={(val) => setFormState((prev) => ({ ...prev, category: val }))}
              placeholder="Select category"
              width="100%"
              menuMaxHeight="240px"
            />
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
              <CustomDropdown
                value={formState.policyId}
                options={policyOptions}
                onChange={(val) => {
                  setPolicyMode("existing");
                  setFormState((prev) => ({ ...prev, policyId: val }));
                }}
                placeholder="Select policy"
                width="100%"
                menuMaxHeight="240px"
                disabled={policyMode === "new"}
              />
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
                <CustomDropdown
                  value={formState.insuranceType}
                  options={insuranceTypeOptions}
                  onChange={(val) => setFormState((prev) => ({ ...prev, insuranceType: val }))}
                  placeholder="Select type"
                  width="100%"
                  menuMaxHeight="240px"
                />
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
