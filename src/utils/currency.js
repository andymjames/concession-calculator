/**
 * Currency and Financial Utilities for Concession Stand Calculator
 */

export const formatCurrency = (amount) => {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const calculateCartTotals = (
  cartItems = [],
  taxRatePercent = 0,
  discountPercent = 0,
) => {
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableSubtotal * (taxRatePercent / 100);
  const total = taxableSubtotal + taxAmount;

  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0,
  );

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalItemCount,
  };
};

export const calculateChange = (total, cashTendered) => {
  const tender = Number(cashTendered) || 0;
  const change = tender - total;
  return {
    tender,
    change: change > 0 ? Math.round(change * 100) / 100 : 0,
    isSufficient: tender >= total,
    shortage: change < 0 ? Math.round(Math.abs(change) * 100) / 100 : 0,
  };
};

export const getQuickCashSuggestions = (total) => {
  if (total <= 0) return [5, 10, 20];

  const presets = [5, 10, 20, 50, 100];
  const higherPresets = presets.filter((p) => p >= total);

  // Next whole dollar or next $5 increment
  const nextDollar = Math.ceil(total);
  const nextFive = Math.ceil(total / 5) * 5;

  const suggestions = new Set();
  if (nextDollar > total) suggestions.add(nextDollar);
  if (nextFive >= total) suggestions.add(nextFive);

  higherPresets.forEach((p) => suggestions.add(p));

  return Array.from(suggestions).slice(0, 4);
};
