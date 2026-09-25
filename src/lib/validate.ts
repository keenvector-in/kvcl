// Field rules shared by every form, each returning the message to show under the field (TextField /
// Select `error`) or undefined when the value is fine. Empty values pass: whether a field is required
// is the form's call (`required`), so an untouched optional field never shows an error.

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PHONE10_RE = /^[6-9]\d{9}$/;
export const PINCODE_RE = /^[1-9]\d{5}$/;
export const HEX_RE = /^#[0-9a-f]{6}$/i;

const blank = (v: string | undefined | null) => v === undefined || v === null || v.trim() === '';

export const required = (v: string | undefined | null, what = 'This field') =>
  blank(v) ? `${what} is required.` : undefined;

export const slugError = (v: string) =>
  blank(v) || SLUG_RE.test(v) ? undefined : 'Lowercase letters, numbers and single hyphens only — no spaces, no leading or trailing hyphen.';

export const phoneError = (v: string) =>
  blank(v) || PHONE10_RE.test(v.replace(/^\+91/, '').replace(/\s/g, '')) ? undefined : 'Enter a 10-digit Indian mobile number.';

export const pincodeError = (v: string) => (blank(v) || PINCODE_RE.test(v.trim()) ? undefined : 'Enter a 6-digit PIN code.');

export const hexError = (v: string) => (blank(v) || HEX_RE.test(v.trim()) ? undefined : 'Use a hex colour like #0E9F6E.');

export const httpsUrlError = (v: string) => {
  if (blank(v)) return undefined;
  try {
    return new URL(v.trim()).protocol === 'https:' ? undefined : 'Use an https:// address.';
  } catch {
    return 'Enter a full address, e.g. https://api.example.com.';
  }
};

/** A whole number within [min, max]; `v` is the raw input text. */
export const wholeNumberError = (v: string, min = 0, max?: number) => {
  if (blank(v)) return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Enter a whole number.';
  if (n < min) return `Enter ${min} or more.`;
  if (max !== undefined && n > max) return `Enter ${max} or less.`;
  return undefined;
};

/** A rupee amount above 0 (or ≥ 0 with allowZero), at most two decimals. */
export const rupeesError = (v: string, allowZero = false) => {
  if (blank(v)) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || (allowZero ? n < 0 : n <= 0)) return allowZero ? 'Enter ₹0 or more.' : 'Enter an amount above ₹0.';
  if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) return 'At most two decimals (paise).';
  return undefined;
};
