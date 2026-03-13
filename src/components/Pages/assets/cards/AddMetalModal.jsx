import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./InvestmentsCard.css";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

const METAL_TYPE_OPTIONS = [
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
  { label: "Platinum", value: "platinum" },
  { label: "Palladium", value: "palladium" },
  { label: "Diamond", value: "diamond" },
  { label: "Other jewellery", value: "jewelry" },
  { label: "Other", value: "other" },
];

export default function AddMetalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) {
  const [metalType, setMetalType] = useState("");
  const [grams, setGrams] = useState("");
  const [buyPricePerGram, setBuyPricePerGram] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
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
      setMetalType("");
      setGrams("");
      setBuyPricePerGram("");
      setPurchasedAt("");
      setFormError("");
      setDateOpen(false);
    } else {
      setFormError("");
      setPurchasedAt((prev) => prev || formatDate(now.getFullYear(), now.getMonth(), now.getDate()));
    }
  }, [isOpen, formatDate, now]);

  useEffect(() => {
    const parsed = parseDate(purchasedAt);
    const target = parsed || now;
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  }, [purchasedAt, now, parseDate]);

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

    setPurchasedAt(dateStr);

    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  const renderDatePicker = () => {
    const parsedDate = parseDate(purchasedAt);
    const displayValue = parsedDate
      ? parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select date";
    const isDatePlaceholder = !purchasedAt;

    return (
      <div className="assets-page-form-row">
        <label htmlFor="metal-purchase-date-trigger">Purchase date *</label>
        <div className="expense-date-wrapper" ref={datePickerRef}>
          <button
            id="metal-purchase-date-trigger"
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
                    const isSelected = purchasedAt === day.dateStr;
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

    const gramsNumber = parseFloat(grams);
    const buyPriceNumber = buyPricePerGram === "" ? undefined : parseFloat(buyPricePerGram);
    const dateValue = purchasedAt?.trim();

    if (!metalType) {
      setFormError("Select a metal type.");
      return;
    }

    if (Number.isNaN(gramsNumber) || gramsNumber <= 0) {
      setFormError("Quantity must be greater than 0 grams.");
      return;
    }

    if (buyPricePerGram !== "" && (Number.isNaN(buyPriceNumber) || buyPriceNumber < 0)) {
      setFormError("Buy price per gram must be zero or more.");
      return;
    }

    if (!dateValue) {
      setFormError("Purchase date is required.");
      return;
    }

    try {
      await onSubmit({
        metal_type: metalType,
        grams: gramsNumber,
        buy_price_per_gram: buyPriceNumber,
        purchased_at: dateValue,
      });
    } catch (err) {
      setFormError(err?.message || "Unable to add metal holding. Please try again.");
    }
  };

  return (
    <div className="assets-page-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal assets-page-modal-investment" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div>
            <p className="assets-page-modal-kicker">New holding</p>
            <h4>Add Precious Metal</h4>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={handleClose}
            aria-label="Close add metal"
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
              <label htmlFor="metal-type">Metal type *</label>
              <CustomDropdown
                id="metal-type"
                label="Metal type"
                options={METAL_TYPE_OPTIONS}
                value={metalType}
                onChange={setMetalType}
                placeholder="Select metal"
                width="100%"
                menuMaxHeight="220px"
                disabled={isSubmitting}
              />
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="metal-grams">Quantity (g) *</label>
              <input
                id="metal-grams"
                name="metal-grams"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span className="assets-page-hint">Must be greater than 0; decimals allowed.</span>
            </div>

            <div className="assets-page-form-row">
              <label htmlFor="metal-buy-price">Buy price per gram (optional)</label>
              <input
                id="metal-buy-price"
                name="metal-buy-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={buyPricePerGram}
                onChange={(e) => setBuyPricePerGram(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {renderDatePicker()}
          </div>

          <div className="assets-page-form-note">
            <p>Tracks physical metals in grams; no currency or derived totals are entered here.</p>
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
              {isSubmitting ? "Saving..." : "Add metal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
