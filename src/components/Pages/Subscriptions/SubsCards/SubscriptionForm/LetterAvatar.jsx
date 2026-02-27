import React from "react";
import "./avatar.css";

const getInitial = (rawName) => {
  const trimmed = rawName ? String(rawName).trim() : "";
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
};

const stringToColor = (value) => {
  const safeValue = value ? String(value) : "default";
  let hash = 0;

  // Derive a stable hue from the string so colors stay consistent across renders.
  for (let i = 0; i < safeValue.length; i += 1) {
    hash = (hash * 31 + safeValue.charCodeAt(i)) & 0xffffffff;
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 68%, 55%)`;
};

export default function LetterAvatar({ name, size = 48 }) {
  const displayName = name ? String(name).trim() : "";
  const initial = getInitial(displayName);
  const backgroundColor = stringToColor(displayName);
  const fontSize = Math.max(12, Math.round(size * 0.44));

  const style = {
    width: size,
    height: size,
    backgroundColor,
    fontSize,
    fontWeight: 600,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    userSelect: "none",
    flexShrink: 0,
  };

  return (
    <div
      className="avatar-wrapper letter-avatar"
      style={style}
      aria-label={displayName ? `${displayName} logo` : "Subscription logo placeholder"}
    >
      {initial}
    </div>
  );
}
