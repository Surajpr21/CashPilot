import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const isPlaceholder = value === undefined || value === null || value === "";
  const selectedOption = isPlaceholder ? null : options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) {
        return;
      }
      if (dropdownRef.current) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const rect = dropdownRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const handleSelect = (option) => {
    if (disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const menu =
    !disabled &&
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        className="cp-dropdown-menu cp-dropdown-menu-portal"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
          ...(menuMaxHeight ? { maxHeight: menuMaxHeight, overflowY: "auto" } : {}),
        }}
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
      </div>,
      document.body
    );

  return (
    <div
      className={`cp-dropdown ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
      style={{ width }}
    >
      <div
        className={`cp-dropdown-trigger ${open ? "open" : ""} ${disabled ? "disabled" : ""} ${isPlaceholder ? "is-placeholder" : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
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
      {menu}
    </div>
  );
}
