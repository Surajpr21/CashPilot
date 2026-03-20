const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toSafeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStartOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getGoalTargetDate(goal) {
  const rawDate = goal?.targetDate ?? goal?.target_date ?? null;
  if (!rawDate) return null;

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return null;

  return toStartOfDay(parsed);
}

export function getGoalStatus(goal) {
  const targetAmount = toSafeNumber(goal?.targetAmount ?? goal?.target_amount);
  const savedAmount = toSafeNumber(goal?.savedAmount ?? goal?.saved_amount);

  if (targetAmount > 0 && savedAmount >= targetAmount) {
    return "completed";
  }

  const targetDate = getGoalTargetDate(goal);
  if (!targetDate) {
    return "active";
  }

  const today = toStartOfDay(new Date());
  if (today > targetDate) {
    return "overdue";
  }

  return "active";
}

export function getRemainingAmount(goal) {
  const targetAmount = toSafeNumber(goal?.targetAmount ?? goal?.target_amount);
  const savedAmount = toSafeNumber(goal?.savedAmount ?? goal?.saved_amount);
  return Math.max(targetAmount - savedAmount, 0);
}

export function getDaysOverdue(goal) {
  const targetDate = getGoalTargetDate(goal);
  if (!targetDate) return 0;

  const today = toStartOfDay(new Date());
  const diff = today.getTime() - targetDate.getTime();
  if (diff <= 0) return 0;

  return Math.floor(diff / MS_PER_DAY);
}

export function withDerivedGoalStatus(goal) {
  return {
    ...goal,
    status: getGoalStatus(goal),
  };
}
