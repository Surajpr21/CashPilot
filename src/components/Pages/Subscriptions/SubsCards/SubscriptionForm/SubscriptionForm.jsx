import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomDropdown from "../../../../CustomDropdown/CustomDropdown";
import { addSubscription, updateSubscription } from "../../../../../services/subscriptions";
import "./SubscriptionForm.css";

const initialState = {
  name: "",
  amount: "",
  billing_cycle: "monthly",
  next_billing_date: "",
  category: "entertainment",
  payment_method: "card",
};

export default function SubscriptionForm({ onClose, onSubscriptionAdded, editMode = false, subscription = null }) {
  const [form, setForm] = useState(
    editMode && subscription
      ? {
          name: subscription.name || "",
          amount: subscription.amount || "",
          billing_cycle: subscription.billing_cycle || "monthly",
          next_billing_date: subscription.next_due || "",
          category: subscription.category || "entertainment",
          payment_method: subscription.payment_method || "card",
        }
      : initialState
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const datePickerRef = useRef(null);

  const now = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => (form.next_billing_date ? new Date(form.next_billing_date).getMonth() : now.getMonth()));
  const [viewYear, setViewYear] = useState(() => (form.next_billing_date ? new Date(form.next_billing_date).getFullYear() : now.getFullYear()));
  const weekDays = useMemo(() => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], []);

  const formatDate = useCallback((year, month, day) => {
    const normalized = new Date(year, month, day);
    const y = normalized.getFullYear();
    const m = normalized.getMonth();
    const d = normalized.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }, []);

  const todayString = useMemo(() => formatDate(now.getFullYear(), now.getMonth(), now.getDate()), [formatDate, now]);

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
    const start = Math.min(viewYear, currentYear) - 2;
    const end = Math.max(viewYear, currentYear) + 6;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((year) => ({
      value: year,
      label: String(year),
    }));
  }, [now, viewYear]);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // start Monday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrevMonth - i;
      cells.push({ day, monthOffset: -1, dateStr: formatDate(viewYear, viewMonth - 1, day) });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, monthOffset: 0, dateStr: formatDate(viewYear, viewMonth, day) });
    }

    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({ day: nextDay, monthOffset: 1, dateStr: formatDate(viewYear, viewMonth + 1, nextDay) });
      nextDay += 1;
    }

    return cells;
  }, [viewMonth, viewYear, formatDate]);

  const handleMonthNav = (delta) => {
    setViewMonth((prev) => {
      const next = prev + delta;
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  };

  const handleMonthChange = (val) => setViewMonth(Number(val));
  const handleYearChange = (val) => setViewYear(Number(val));

  const handleDaySelect = (dayInfo) => {
    setForm((prev) => ({ ...prev, next_billing_date: dayInfo.dateStr }));
    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  useEffect(() => {
    if (!form.next_billing_date) return;
    const parsed = new Date(form.next_billing_date);
    if (Number.isNaN(parsed.getTime())) return;
    setViewMonth(parsed.getMonth());
    setViewYear(parsed.getFullYear());
  }, [form.next_billing_date]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!datePickerRef.current) return;
      const isInside = datePickerRef.current.contains(e.target);
      const isDropdownMenu = e.target.closest(".custom-dropdown-menu") || e.target.closest(".cp-dropdown");
      if (!isInside && !isDropdownMenu) {
        setDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const billingCycleOptions = useMemo(
    () => [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "yearly", label: "Yearly" },
    ],
    []
  );

  const categoryOptions = useMemo(
    () => [
      { value: "entertainment", label: "Entertainment" },
      { value: "utilities", label: "Utilities" },
      { value: "productivity", label: "Productivity" },
      { value: "education", label: "Education" },
      { value: "health", label: "Health" },
    ],
    []
  );

  const paymentOptions = useMemo(
    () => [
      { value: "card", label: "Card" },
      { value: "upi", label: "UPI" },
      { value: "wallet", label: "Wallet" },
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        amount: form.amount ? Number(form.amount) : 0,
        category: form.category,
        billing_cycle: form.billing_cycle,
        next_due: form.next_billing_date,
        payment_method: form.payment_method || null,
      };

      if (editMode && subscription) {
        await updateSubscription(subscription.id, payload);
        setSuccess("Subscription updated");
      } else {
        await addSubscription(payload);
        setSuccess("Subscription added");
        setForm(initialState);
      }

      if (onSubscriptionAdded) onSubscriptionAdded();

      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="subs-form" onSubmit={handleSubmit}>
      <div className="subs-form-header">
        <h3>{editMode ? "Edit Subscription" : "Add Subscription"}</h3>
        {onClose && (
          <button
            type="button"
            className="subs-form-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>

      <div className="subs-form-grid">
        <label className="subs-form-field">
          <span>Subscription Name</span>
          <input
            type="text"
            name="name"
            placeholder="Netflix"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="subs-form-field">
          <span>Amount</span>
          <div className="subs-amount-input">
            <span className="subs-amount-prefix">₹</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              placeholder="499"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
        </label>

        <label className="subs-form-field">
          <span>Billing Cycle</span>
          <CustomDropdown
            value={form.billing_cycle}
            options={billingCycleOptions}
            onChange={(val) => setForm((prev) => ({ ...prev, billing_cycle: val }))}
            placeholder="Select billing cycle"
            width="100%"
          />
        </label>

        <label className="subs-form-field">
          <span>Next Billing Date</span>
          <div className="subs-date-wrapper" ref={datePickerRef}>
            <button
              type="button"
              className={`subs-date-trigger ${dateOpen ? "open" : ""} ${!form.next_billing_date ? "placeholder" : ""}`}
              onClick={() => setDateOpen((prev) => !prev)}
              aria-expanded={dateOpen}
              aria-haspopup="dialog"
            >
              <span className={!form.next_billing_date ? "placeholder" : ""}>
                {form.next_billing_date
                  ? new Date(form.next_billing_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Select date"}
              </span>
              <span className="subs-date-icon" aria-hidden="true">
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
                className="subs-date-popover"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="subs-date-picker">
                  <div className="subs-date-header">
                    <button
                      type="button"
                      className="subs-date-nav"
                      aria-label="Previous month"
                      onClick={() => handleMonthNav(-1)}
                    >
                      {"<"}
                    </button>

                    <div className="subs-date-controls">
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
                      className="subs-date-nav"
                      aria-label="Next month"
                      onClick={() => handleMonthNav(1)}
                    >
                      {">"}
                    </button>
                  </div>

                  <div className="subs-date-weekdays">
                    {weekDays.map((day) => (
                      <span key={day} className="subs-date-weekday">
                        {day}
                      </span>
                    ))}
                  </div>

                  <div className="subs-date-grid">
                    {calendarDays.map((day) => {
                      const isOutside = day.monthOffset !== 0;
                      const isSelected = form.next_billing_date === day.dateStr;
                      const isToday = todayString === day.dateStr;

                      return (
                        <button
                          type="button"
                          key={day.dateStr}
                          className={`subs-date-cell ${isOutside ? "outside" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                          onClick={() => handleDaySelect(day)}
                          aria-label={`Select ${day.dateStr}`}
                          aria-pressed={isSelected}
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

        <label className="subs-form-field">
          <span>Category</span>
          <CustomDropdown
            value={form.category}
            options={categoryOptions}
            onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
            placeholder="Select category"
            width="100%"
          />
        </label>

        <label className="subs-form-field">
          <span>Payment Method</span>
          <CustomDropdown
            value={form.payment_method}
            options={paymentOptions}
            onChange={(val) => setForm((prev) => ({ ...prev, payment_method: val }))}
            placeholder="Select payment method"
            width="100%"
          />
        </label>
      </div>

      <div className="subs-form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editMode ? "Update Subscription" : "Save Subscription"}
        </button>
      </div>

      {error && <div className="subs-form-error">{error}</div>}
      {success && <div className="subs-form-success">{success}</div>}
    </form>
  );
}
