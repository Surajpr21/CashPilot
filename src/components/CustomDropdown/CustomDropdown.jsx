import React, { useState, useRef, useEffect } from "react";
import "./CustomDropdown.css";

export default function CustomDropdown({
  label = "Select",
  options = [],
  value,
  onChange,
  placeholder = "Select",
  width = "180px",
  menuMaxHeight,
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

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
        className={`cp-dropdown-trigger ${open ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
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
          style={menuMaxHeight ? { maxHeight: menuMaxHeight, overflowY: "auto" } : undefined}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`cp-dropdown-item ${
                option.value === value ? "active" : ""
              }`}
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
