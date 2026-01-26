export function formatCurrency(value, currency) {
  const amount = Number.isFinite(value) ? value : 0;

  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (_err) {
      // Fallback to plain number formatting when currency code is invalid or missing Intl support.
      return new Intl.NumberFormat().format(amount);
    }
  }

  return new Intl.NumberFormat().format(amount);
}

export function formatNumber(value, options) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, options).format(amount);
}
