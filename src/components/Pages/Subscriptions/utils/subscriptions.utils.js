export const formatAmount = (amt) => `₹${Number(amt || 0).toLocaleString("en-IN")}`;

export const daysLeft = (date) => {
  if (!date) return NaN;
  const diff = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const dateLabel = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

export const cycleLabel = (cycle) => {
  if (!cycle) return "";
  const map = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };
  return map[cycle] || cycle;
};

export const getStatus = (sub) => {
  if (!sub) return "active";
  if (sub.status === "inactive") return "inactive";
  if (sub.status === "paused") return "paused";
  const d = daysLeft(sub.next_due);
  if (Number.isNaN(d)) return "active";
  if (d < 0) return "overdue";
  if (d <= 7) return "due-soon";
  return "active";
};

export const getMonthlyAmount = (amount, cycle) => {
  const amt = Number(amount || 0);
  switch (cycle) {
    case "monthly":
      return amt;
    case "quarterly":
      return amt / 3;
    case "yearly":
      return amt / 12;
    default:
      return 0;
  }
};

export const getMonthlyTotal = (subscriptions = []) => {
  return subscriptions
    .filter((sub) => sub && sub.status === "active")
    .reduce((sum, sub) => {
      return sum + getMonthlyAmount(sub.amount, sub.billing_cycle);
    }, 0);
};
