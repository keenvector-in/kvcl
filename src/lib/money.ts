/**
 * Minor units (paise) to a display string: 149900 → "₹1,499", 149950 → "₹1,499.50".
 * Display only — never use the result for arithmetic; money stays integer paise.
 */
export function formatMinor(amountMinor: number, currency = 'INR'): string {
  const hasFraction = amountMinor % 100 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
