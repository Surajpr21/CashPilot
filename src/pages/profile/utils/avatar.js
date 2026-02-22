export function generateAvatar(name = "User") {
  const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const color = colors[name.length % colors.length];

  return { initials, color };
}
