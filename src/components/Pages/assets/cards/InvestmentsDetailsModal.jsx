import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoneyBag02Icon } from "@hugeicons/core-free-icons";
import {
  getInvestmentsDetails,
  updateInvestment,
  softDeleteInvestment,
} from "../../../../lib/api/assets.api";
import "./InvestmentsCard.css";
import { formatCurrency } from "../../../../lib/formatters";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";

const INVESTMENT_TYPES = [
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Stock", value: "stock" },
  { label: "Fixed Deposit (FD)", value: "fixed_deposit" },
  { label: "Recurring Deposit (RD)", value: "recurring_deposit" },
  { label: "Other", value: "other" },
];

const TYPE_LABELS = INVESTMENT_TYPES.reduce((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {});

const getInvestmentRowId = (investment) => {
  if (!investment || typeof investment !== "object") return null;
  return investment.id ?? investment.investment_id ?? investment.investmentId ?? null;
};

export default function InvestmentsDetailsModal({ isOpen, onClose, currency }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    investment_type: "",
    amount_invested: "",
    created_at: "",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const datePickerRef = useRef(null);

  const now = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => now.getMonth());
  const [viewYear, setViewYear] = useState(() => now.getFullYear());

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["investments-details"],
    queryFn: () => getInvestmentsDetails(),
    enabled: isOpen,
  });

  const investments = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const formatDate = useCallback((year, month, day) => {
    const normalized = new Date(year, month, day);
    const y = normalized.getFullYear();
    const m = normalized.getMonth();
    const d = normalized.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }, []);

  const toInputDate = (value) => {
    if (!value) return "";
    const dateText = String(value);
    if (dateText.includes("T")) return dateText.split("T")[0];
    return dateText;
  };

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
    const parsed = parseDate(form.created_at);
    const target = parsed || now;
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  }, [form.created_at, now, parseDate]);

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

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", investment_type: "", amount_invested: "", created_at: "" });
    setFormError("");
    setDateOpen(false);
  };

  const startEdit = (investment) => {
    const rowId = getInvestmentRowId(investment);
    if (!rowId) {
      setFormError("Unable to edit this row because its ID is missing.");
      return;
    }

    setEditingId(rowId);
    setForm({
      name: investment.name || "",
      investment_type: investment.investment_type || "",
      amount_invested: investment.amount_invested ?? "",
      created_at: toInputDate(investment.created_at),
    });
    setFormError("");
    setDateOpen(false);
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

    setForm((f) => ({ ...f, created_at: dateStr }));

    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  const renderDatePicker = () => {
    const parsedDate = parseDate(form.created_at);
    const displayValue = parsedDate
      ? parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select date";
    const isDatePlaceholder = !form.created_at;

    return (
      <div className="assets-page-form-row">
        <label htmlFor="inv-date-trigger">Investment date</label>
        <div className="expense-date-wrapper" ref={datePickerRef}>
          <button
            id="inv-date-trigger"
            type="button"
            className={`date-picker-trigger ${dateOpen ? "open" : ""} ${isDatePlaceholder ? "placeholder" : ""}`}
            onClick={() => {
              if (isSaving) return;
              setDateOpen((prev) => !prev);
            }}
            aria-expanded={dateOpen}
            aria-haspopup="dialog"
            disabled={isSaving}
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

          {dateOpen && !isSaving && (
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
                    const isSelected = form.created_at === day.dateStr;
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editingId === null || editingId === undefined || editingId === "") return;
    const name = form.name.trim();
    const investment_type = form.investment_type;
    const amountNum = parseFloat(form.amount_invested);
    const editedDate = toInputDate(form.created_at);

    if (!name || !investment_type) {
      setFormError("Name and type are required.");
      return;
    }
    if (Number.isNaN(amountNum) || amountNum < 0) {
      setFormError("Amount must be zero or more.");
      return;
    }
    if (editedDate && editedDate > todayString) {
      setFormError("Investment date cannot be in the future.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await updateInvestment(editingId, {
        name,
        investment_type,
        amount_invested: amountNum,
        created_at: editedDate || null,
      });
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["investments-total"] });
      queryClient.invalidateQueries({ queryKey: ["investments-details"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to update investment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (investmentId) => {
    if (investmentId === null || investmentId === undefined || investmentId === "") {
      setFormError("Unable to delete this row because its ID is missing.");
      return;
    }

    const ok = window.confirm("This will remove the investment from assets. It will remain archived.");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await softDeleteInvestment(investmentId);
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["investments-total"] });
      queryClient.invalidateQueries({ queryKey: ["investments-details"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to delete investment.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isEditPopupOpen = editingId !== null && editingId !== undefined && editingId !== "";

  const renderEditPopup = () => {
    if (!isEditPopupOpen) return null;

    return (
      <div
        className="assets-page-modal-backdrop assets-page-modal-edit-backdrop"
        onClick={(e) => {
          e.stopPropagation();
          resetForm();
        }}
      >
        <div
          className="assets-page-modal assets-page-modal-investment assets-page-modal-edit-popup"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="assets-page-modal-header">
            <div>
              <p className="assets-page-modal-kicker">Investments</p>
              <h4>Edit investment</h4>
            </div>
            <button type="button" className="assets-page-modal-close" onClick={resetForm} aria-label="Close edit investment">
              ×
            </button>
          </div>

          <form className="assets-page-form assets-page-form-investment" onSubmit={handleUpdate}>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid assets-page-form-grid-investment">
              <div className="assets-page-form-row">
                <label htmlFor="inv-name">Name *</label>
                <input
                  id="inv-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="inv-type">Investment type *</label>
                <CustomDropdown
                  id="inv-type"
                  label="Investment type"
                  options={INVESTMENT_TYPES}
                  value={form.investment_type}
                  onChange={(val) => setForm((f) => ({ ...f, investment_type: val }))}
                  placeholder="Select type"
                  width="100%"
                  menuMaxHeight="220px"
                  disabled={isSaving}
                />
                <span className="assets-page-hint">Values map directly to the enum in Supabase.</span>
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="inv-amount">Amount invested *</label>
                <input
                  id="inv-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_invested}
                  onChange={(e) => setForm((f) => ({ ...f, amount_invested: e.target.value }))}
                  required
                  disabled={isSaving}
                />
              </div>

              {renderDatePicker()}

              <div className="assets-page-form-row">
                <label htmlFor="inv-currency">Currency</label>
                <input id="inv-currency" type="text" value="INR" readOnly disabled />
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
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="assets-page-btn primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="assets-page-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="assets-page-modal assets-page-modal-investment assets-page-modal-details" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div style={{zIndex:"99"}} className="assets-page-card-heading">
            <span className="assets-page-card-icon assets-page-card-icon-investments" aria-hidden="true">
              <HugeiconsIcon icon={MoneyBag02Icon} size={25} strokeWidth={1.9} color="#10b981" />
            </span>
            <h3>Investments</h3>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close investments details"
          >
            ×
          </button>
        </div>

        {isLoading || isFetching ? <p>Loading investments…</p> : null}
        {isError ? <p>Unable to load investments right now.</p> : null}

        {investments.length === 0 && !isLoading ? (
          <p className="assets-page-muted">No investments found.</p>
        ) : (
          <div className="assets-page-list assets-page-list-scrollable">
            {investments.map((inv, index) => {
              const rowId = getInvestmentRowId(inv);

              return (
              <div className="assets-page-row" key={rowId || `investment-row-${index}`}>
                <div className="assets-page-row-main">
                  <div className="assets-item-title">{inv.name}</div>
                  <div className="assets-meta-list">
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Type</span>
                      <span className="assets-meta-value">{TYPE_LABELS[inv.investment_type] || "Other"}</span>
                    </div>
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Investment date</span>
                      <span className="assets-meta-value">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "-"}
                      </span>
                    </div>
                    <div className="assets-meta-row-line">
                      <span className="assets-meta-label">Amount invested</span>
                      <span className="assets-meta-value">₹ {formatCurrency(inv.amount_invested)}</span>
                    </div>
                  </div>
                </div>
                <div className="assets-page-row-meta">
                  <button
                    type="button"
                    className="assets-page-btn assets-action-btn-edit"
                    onClick={() => startEdit(inv)}
                    disabled={isSaving || isDeleting || !rowId}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="assets-page-btn assets-action-btn-delete"
                    onClick={() => handleDelete(rowId)}
                    disabled={isSaving || isDeleting || !rowId}
                  >
                    Delete
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
        {formError && !editingId ? <div className="assets-page-form-error">{formError}</div> : null}
      </div>

      {renderEditPopup()}
    </div>
  );
}
