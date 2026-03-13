import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./InvestmentsCard.css";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

const INVESTMENT_TYPES = [
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Stock", value: "stock" },
  { label: "Fixed Deposit (FD)", value: "fixed_deposit" },
  { label: "Recurring Deposit (RD)", value: "recurring_deposit" },
  { label: "Other", value: "other" },
];

export default function AddInvestmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [name, setName] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [amount, setAmount] = useState("");
  const [investmentDate, setInvestmentDate] = useState("");
  const [formError, setFormError] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const datePickerRef = useRef(null);

  const now = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => now.getMonth());
  const [viewYear, setViewYear] = useState(() => now.getFullYear());

  const formatDate = useCallback((year, month, day) => {
    const normalized = new Date(year, month, day);
    const y = normalized.getFullYear();
    const m = normalized.getMonth();
    const d = normalized.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }, []);

  const parseDate = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const [y, m, d] = dateStr.split("-").map((v) => Number(v));
    if (!y || !m || !d) return null;
    const parsed = new Date(y, m - 1, d);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const todayString = useMemo(
    () => formatDate(now.getFullYear(), now.getMonth(), now.getDate()),
    [formatDate, now]
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

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
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
    if (!isOpen) {
      setName("");
      setInvestmentType("");
      setAmount("");
      setInvestmentDate("");
      setFormError("");
      setDateOpen(false);
    } else {
      setFormError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const parsed = parseDate(investmentDate);
    const target = parsed || now;
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  }, [investmentDate, now, parseDate]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!datePickerRef.current) return;
      if (!datePickerRef.current.contains(e.target)) {
        setDateOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormError("");
    setDateOpen(false);
    onClose();
  };

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

    setInvestmentDate(dateStr);

    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  const renderDatePicker = () => {
    const parsedDate = parseDate(investmentDate);
    const displayValue = parsedDate
      ? parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select date";
    const isDatePlaceholder = !investmentDate;

    return (
      <div className="assets-page-form-row">
        <label htmlFor="investment-date-trigger">Investment date</label>
        <div className="expense-date-wrapper" ref={datePickerRef}>
          <button
            id="investment-date-trigger"
            type="button"
            className={`date-picker-trigger ${dateOpen ? "open" : ""} ${isDatePlaceholder ? "placeholder" : ""}`}
            onClick={() => {
              if (isSubmitting) return;
              setDateOpen((prev) => !prev);
            }}
            aria-expanded={dateOpen}
            aria-haspopup="dialog"
            disabled={isSubmitting}
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

          {dateOpen && !isSubmitting && (
            <div className="expense-date-popover">
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
                    const isSelected = investmentDate === day.dateStr;
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
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedName = name.trim();
    const amountNumber = parseFloat(amount);
    const currency = "INR";

    if (!trimmedName) {
      setFormError("Enter an investment name.");
      return;
    }

    if (!investmentType) {
      setFormError("Select an investment type.");
      return;
    }

    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      setFormError("Amount invested must be zero or more.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        investment_type: investmentType,
        amount_invested: amountNumber,
        currency,
        ...(investmentDate ? { created_at: investmentDate } : {}),
      });
    } catch (err) {
      setFormError(err?.message || "Unable to add investment. Please try again.");
    }
  };

  return (
    <div className="assets-page-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal assets-page-modal-investment" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div>
            <p className="assets-page-modal-kicker">New investment</p>
            <h4>Add investment</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={handleClose}
            aria-label="Close add investment"
          >
            ×
          </button>
        </div>

        <form className="assets-page-form assets-page-form-investment" onSubmit={handleSubmit}>
          {formError || errorMessage ? (
            <div className="assets-page-form-error">{formError || errorMessage}</div>
          ) : null}

          <div className="assets-page-form-grid assets-page-form-grid-investment">
            <div className="assets-page-form-row">
              <label htmlFor="investment-name">Investment name *</label>
              <input
                id="investment-name"
                name="investment-name"
                type="text"
                placeholder="Nifty 50 Index Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="investment-type">Investment type *</label>
              <CustomDropdown
                id="investment-type"
                label="Investment type"
                options={INVESTMENT_TYPES}
                value={investmentType}
                onChange={setInvestmentType}
                placeholder="Select type"
                width="100%"
                menuMaxHeight="220px"
                disabled={isSubmitting}
              />
              <span className="assets-page-hint">Values map directly to the enum in Supabase.</span>
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="investment-amount">Amount invested *</label>
              <input
                id="investment-amount"
                name="investment-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {renderDatePicker()}

            <div className="assets-page-form-row">
              <label htmlFor="investment-currency">Currency</label>
              <input
                id="investment-currency"
                name="investment-currency"
                type="text"
                value="INR"
                readOnly
                disabled
              />
              <span className="assets-page-hint">Locked to INR; does not hit cash balance.</span>
            </div>
          </div>

          <div className="assets-page-form-note">
            <p>Records long-term investments only. Account balance is unchanged.</p>
          </div>

          <div className="assets-page-modal-actions assets-page-modal-actions-investment">
            <button
              type="button"
              className="assets-page-btn ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="assets-page-btn primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
