import { describe, expect, it } from 'vitest';
import { errorText } from './index';

describe('errorText', () => {
  it('turns identity codes and raw messages into sentences', () => {
    const coded = Object.assign(new Error('email or password is incorrect'), { code: 'invalid_credentials' });
    expect(errorText(coded)).toMatch(/^That email and password/);
    expect(errorText(new Error('something odd'))).toBe('Something odd');
    expect(errorText(new Error('Failed to fetch'))).toMatch(/Can’t reach the server/);
    expect(errorText('nope')).toBe('Something went wrong, try again.');
  });
});
