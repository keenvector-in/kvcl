import { describe, expect, it } from 'vitest';
import { hexError, httpsUrlError, phoneError, pincodeError, required, rupeesError, slugError, wholeNumberError } from './validate';

describe('validate', () => {
  it('lets empty values through (required is separate)', () => {
    for (const f of [slugError, phoneError, pincodeError, hexError, httpsUrlError]) expect(f('')).toBeUndefined();
    expect(required('  ', 'Name')).toBe('Name is required.');
  });
  it('slug', () => {
    expect(slugError('my-store-2')).toBeUndefined();
    for (const bad of ['My Store', '-a', 'a-', 'a--b', 'a_b']) expect(slugError(bad)).toBeDefined();
  });
  it('phone and pincode', () => {
    expect(phoneError('9876543210')).toBeUndefined();
    expect(phoneError('+91 98765 43210')).toBeUndefined();
    expect(phoneError('12345')).toBeDefined();
    expect(pincodeError('411001')).toBeUndefined();
    expect(pincodeError('011001')).toBeDefined();
  });
  it('hex and url', () => {
    expect(hexError('#0e9f6e')).toBeUndefined();
    expect(hexError('0e9f6e')).toBeDefined();
    expect(httpsUrlError('https://netconnect.bluedart.com')).toBeUndefined();
    expect(httpsUrlError('http://x.com')).toBe('Use an https:// address.');
    expect(httpsUrlError('bluedart')).toBeDefined();
  });
  it('numbers', () => {
    expect(wholeNumberError('5')).toBeUndefined();
    expect(wholeNumberError('2.5')).toBe('Enter a whole number.');
    expect(wholeNumberError('-1')).toBe('Enter 0 or more.');
    expect(wholeNumberError('0', 1)).toBe('Enter 1 or more.');
    expect(rupeesError('499.99')).toBeUndefined();
    expect(rupeesError('0')).toBe('Enter an amount above ₹0.');
    expect(rupeesError('0', true)).toBeUndefined();
    expect(rupeesError('1.234')).toBe('At most two decimals (paise).');
  });
});
