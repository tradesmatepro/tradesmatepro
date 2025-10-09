export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    // Fallback
    const v = isFinite(value) ? value : 0;
    return `${currency === 'USD' ? '$' : ''}${v.toFixed(2)}`;
  }
};

export const formatHours = (hours) => {
  const h = Number(hours || 0);
  if (!isFinite(h)) return '0 hrs';
  if (h === 0) return '0 hrs';
  if (h < 8) return `${h.toFixed(1)} hrs`;
  const days = Math.floor(h / 8);
  const rem = h % 8;
  return rem > 0 ? `${days}d ${rem.toFixed(1)}h` : `${days}d`;
};

