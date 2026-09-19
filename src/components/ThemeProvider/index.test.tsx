import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, themeStyle } from './index';

describe('ThemeProvider', () => {
  it('sets brand variables and mode for its subtree', () => {
    render(
      <ThemeProvider theme={{ brandColor: '#059669', mode: 'light' }}>
        <span>inside</span>
      </ThemeProvider>,
    );
    const root = screen.getByText('inside').parentElement!;
    expect(root).toHaveAttribute('data-kv-mode', 'light');
    expect(root.style.getPropertyValue('--kv-brand')).toBe('#059669');
  });

  it('drops colours that are not #rrggbb instead of injecting them', () => {
    const style = themeStyle({ brandColor: 'red; background:url(x)', accentColor: '#14b8a6' }) as Record<string, string>;
    expect(style['--kv-brand']).toBeUndefined();
    expect(style['--kv-accent']).toBe('#14b8a6');
  });
});
