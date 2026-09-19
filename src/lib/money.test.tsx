import { describe, expect, it } from 'vitest';
import { formatMinor } from './money';

describe('formatMinor', () => {
  it('drops decimals for whole amounts', () => {
    expect(formatMinor(149900)).toBe('₹1,499');
  });

  it('keeps two decimals for part amounts', () => {
    expect(formatMinor(149950)).toBe('₹1,499.50');
  });

  it('formats zero', () => {
    expect(formatMinor(0)).toBe('₹0');
  });

  it('honours the currency code', () => {
    expect(formatMinor(100000, 'USD')).toContain('1,000');
  });
});
