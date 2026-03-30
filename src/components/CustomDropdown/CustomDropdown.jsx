import React, { useState, useRef, useEffect } from "react";
import "./CustomDropdown.css";

export default function CustomDropdown({
  id,
  label = "Select",
  options = [],
  value,
  onChange,
  placeholder = "Select",
  width = "180px",
  menuMaxHeight,
  disabled = false,
  disableShine = false,
  disableBounce = false
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isPlaceholder = value === undefined || value === null || value === "";
  const selectedOption = isPlaceholder ? null : options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const handleSelect = (option) => {
    if (disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div
      className={`cp-dropdown ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
      style={{ width }}
    >
      <div
        id={id}
        className={`cp-dropdown-trigger ${open ? "open" : ""} ${disabled ? "disabled" : ""} ${isPlaceholder ? "is-placeholder" : ""} ${disableShine ? "no-shine" : ""} ${disableBounce ? "no-bounce" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (disabled) return;

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }

          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span className={isPlaceholder ? "cp-dropdown-placeholder" : ""}>
          {isPlaceholder ? placeholder : selectedOption?.label || placeholder}
        </span>

        <svg
          className={`cp-dropdown-icon ${open ? "rotate" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!disabled && open && (
        <div
          className="cp-dropdown-menu"
          role="listbox"
          style={menuMaxHeight ? { maxHeight: menuMaxHeight, overflowY: "auto" } : undefined}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`cp-dropdown-item ${
                option.value === value ? "active" : ""
              }`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
