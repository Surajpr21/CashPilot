import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { formatCurrency, formatNumber } from "../../../../lib/formatters";
import {
  getMetalHoldingsDetails,
  updateMetalHolding,
  softDeleteMetalHolding,
} from "../../../../lib/api/assets.api";
import CustomDropdown from "../../../CustomDropdown/CustomDropdown";
import "./InvestmentsCard.css";
import "./GoldDetailsCard.css";

const METAL_LABELS = {
  gold: "Gold",
  silver: "Silver",
  platinum: "Platinum",
  palladium: "Palladium",
  diamond: "Diamond",
  jewelry: "Other jewellery",
  other: "Other",
};

const METAL_TYPE_OPTIONS = [
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
  { label: "Platinum", value: "platinum" },
  { label: "Palladium", value: "palladium" },
  { label: "Diamond", value: "diamond" },
  { label: "Other jewellery", value: "jewelry" },
  { label: "Other", value: "other" },
];

export default function MetalsDetailsModal({ isOpen, onClose, metalHoldings = [] }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ metal_type: "", grams: "", buy_price_per_gram: "", purchased_at: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const datePickerRef = useRef(null);

  const now = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => now.getMonth());
  const [viewYear, setViewYear] = useState(() => now.getFullYear());

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["metal-holdings-details"],
    queryFn: () => getMetalHoldingsDetails(),
    enabled: isOpen,
  });

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

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
    const parsed = parseDate(form.purchased_at);
    const target = parsed || now;
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
  }, [form.purchased_at, now, parseDate]);

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
    setForm({ metal_type: "", grams: "", buy_price_per_gram: "", purchased_at: "" });
    setFormError("");
    setDateOpen(false);
  };

  const startEdit = (holding) => {
    setEditingId(holding.id);
    setForm({
      metal_type: holding.metal_type || "",
      grams: holding.grams ?? "",
      buy_price_per_gram: holding.buy_price_per_gram ?? "",
      purchased_at: holding.purchased_at || "",
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

    setForm((f) => ({ ...f, purchased_at: dateStr }));

    const target = new Date(viewYear, viewMonth + dayInfo.monthOffset, dayInfo.day);
    setViewMonth(target.getMonth());
    setViewYear(target.getFullYear());
    setDateOpen(false);
  };

  const renderDatePicker = () => {
    const parsedDate = parseDate(form.purchased_at);
    const displayValue = parsedDate
      ? parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select date";
    const isDatePlaceholder = !form.purchased_at;

    return (
      <div className="assets-page-form-row">
        <label htmlFor="metal-purchase-date-edit-trigger">Purchase date *</label>
        <div className="expense-date-wrapper" ref={datePickerRef}>
          <button
            id="metal-purchase-date-edit-trigger"
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
                    const isSelected = form.purchased_at === day.dateStr;
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
    if (!editingId) return;

    const gramsNum = parseFloat(form.grams);
    const buyPriceNum = form.buy_price_per_gram === "" ? null : parseFloat(form.buy_price_per_gram);

    if (!form.metal_type) {
      setFormError("Metal type is required.");
      return;
    }
    if (Number.isNaN(gramsNum) || gramsNum <= 0) {
      setFormError("Quantity must be greater than 0 grams.");
      return;
    }
    if (form.buy_price_per_gram !== "" && (Number.isNaN(buyPriceNum) || buyPriceNum < 0)) {
      setFormError("Buy price per gram must be zero or more.");
      return;
    }
    if (!form.purchased_at) {
      setFormError("Purchase date is required.");
      return;
    }
    if (form.purchased_at > todayString) {
      setFormError("Purchase date cannot be in the future.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await updateMetalHolding(editingId, {
        metal_type: form.metal_type,
        grams: gramsNum,
        buy_price_per_gram: buyPriceNum,
        purchased_at: form.purchased_at,
      });
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to update metal holding.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (holdingId) => {
    const ok = window.confirm("This will remove the metal holding from assets. It will remain archived.");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await softDeleteMetalHolding(holdingId);
      resetForm();
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["metals-summary"] });
      queryClient.invalidateQueries({ queryKey: ["assets-total"] });
    } catch (err) {
      setFormError(err?.message || "Unable to delete metal holding.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isEditPopupOpen = Boolean(editingId);

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
              <p className="assets-page-modal-kicker">Precious Metals</p>
              <h4>Edit metal holding</h4>
            </div>
            <button type="button" className="assets-page-modal-close" onClick={resetForm} aria-label="Close edit metal">
              ×
            </button>
          </div>

          <form className="assets-page-form assets-page-form-investment" onSubmit={handleUpdate}>
            {formError ? <div className="assets-page-form-error">{formError}</div> : null}

            <div className="assets-page-form-grid assets-page-form-grid-investment">
              <div className="assets-page-form-row">
                <label htmlFor="metal-type-edit">Metal type *</label>
                <CustomDropdown
                  id="metal-type-edit"
                  label="Metal type"
                  options={METAL_TYPE_OPTIONS}
                  value={form.metal_type}
                  onChange={(val) => setForm((f) => ({ ...f, metal_type: val }))}
                  placeholder="Select metal"
                  width="100%"
                  menuMaxHeight="240px"
                  disabled={isSaving}
                />
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="metal-grams-edit">Quantity (g) *</label>
                <input
                  id="metal-grams-edit"
                  name="metal-grams-edit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.grams}
                  onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))}
                  required
                  disabled={isSaving}
                />
                <span className="assets-page-hint">Must be greater than 0; decimals allowed.</span>
              </div>

              <div className="assets-page-form-row">
                <label htmlFor="metal-buy-price-edit">Buy price per gram (optional)</label>
                <input
                  id="metal-buy-price-edit"
                  name="metal-buy-price-edit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.buy_price_per_gram}
                  onChange={(e) => setForm((f) => ({ ...f, buy_price_per_gram: e.target.value }))}
                  disabled={isSaving}
                />
              </div>

              {renderDatePicker()}
            </div>

            <div className="assets-page-form-note">
              <p>Tracks physical metals in grams; no currency or derived totals are entered here.</p>
            </div>

            <div className="assets-page-modal-actions assets-page-modal-actions-investment">
              <button type="button" className="assets-page-btn ghost" onClick={resetForm} disabled={isSaving}>
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
      <div className="assets-page-modal assets-page-modal-investment" onClick={(e) => e.stopPropagation()}>
        <div className="assets-page-modal-header">
          <div style={{zIndex:"99"}} className="assets-page-card-heading">
            <span className="assets-page-card-icon assets-page-card-icon-metals" aria-hidden="true">
              <HugeiconsIcon icon={SparklesIcon} size={25} strokeWidth={1.9} color="#f59e0b" />
            </span>
            <h3>Precious Metals Holdings</h3>
          </div>
          <button
            type="button"
            className="assets-page-modal-close"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close metals details"
          >
            ×
          </button>
        </div>

        {isLoading || isFetching ? <p>Loading metal holdings…</p> : null}
        {isError ? <p>Unable to load metal holdings right now.</p> : null}

        {rows.length === 0 && !isLoading ? (
          <p className="assets-page-muted">No metal holdings found.</p>
        ) : (
          <div className="assets-page-list assets-page-list-scrollable">
            {rows.map((metal) => {
              const label = METAL_LABELS[metal?.metal_type] || "Other";
              const grams = formatNumber(metal?.grams ?? 0);
              const avgPrice = metal?.buy_price_per_gram;
              const purchasedAt = metal?.purchased_at;
              const purchasedAtText = purchasedAt
                ? new Date(purchasedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;
              const avgPriceText =
                avgPrice === null || avgPrice === undefined ? "—" : `₹ ${formatCurrency(avgPrice)} / g`;

              return (
                <div className="assets-page-row" key={metal?.id || `${metal?.metal_type}-${grams}-${purchasedAt || "na"}`}>
                  <div className="assets-page-row-main">
                    <div className="assets-item-title">{label}</div>
                    <div className="assets-meta-list">
                      <div className="assets-meta-row-line">
                        <span className="assets-meta-label">Purchased</span>
                        <span className="assets-meta-value">{purchasedAtText || "-"}</span>
                      </div>
                      <div className="assets-meta-row-line">
                        <span className="assets-meta-label">Quantity</span>
                        <span className="assets-meta-value">{grams} g</span>
                      </div>
                      <div className="assets-meta-row-line">
                        <span className="assets-meta-label">Avg price</span>
                        <span className="assets-meta-value">{avgPriceText}</span>
                      </div>
                    </div>
                  </div>
                  <div className="assets-page-row-meta">
                    <button
                      type="button"
                      className="assets-page-btn assets-action-btn-edit"
                      onClick={() => startEdit(metal)}
                      disabled={isSaving || isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="assets-page-btn assets-action-btn-delete"
                      onClick={() => handleDelete(metal.id)}
                      disabled={isSaving || isDeleting}
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
