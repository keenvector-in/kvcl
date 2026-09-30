import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, contrastRatio, labelOn, readableToneText, themeStyle } from './index';

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

describe('themeStyle contrast for tenant colours', () => {
  const awkward = ['#ffff00', '#00ffff', '#777777', '#111111', '#6366f1', '#14b8a6'];
  // The mode's page / surface / sunken (theme.css KeenVector values, dark ones pre-composited).
  const backgrounds = {
    light: ['#f8fafc', '#ffffff', '#f1f5f9'],
    dark: ['#0b111e', '#141a26', '#1c2230', '#090e18'],
  } as const;

  for (const mode of ['light', 'dark'] as const) {
    for (const colour of awkward) {
      it(`${mode} ${colour}: brand-fg and accent-fg reach 4.5:1 on every surface`, () => {
        const style = themeStyle({ brandColor: colour, accentColor: colour, mode }) as Record<string, string>;
        for (const token of ['--kv-brand-fg', '--kv-accent-fg']) {
          expect(style[token]).toMatch(/^#[0-9a-f]{6}$/);
          for (const bg of backgrounds[mode]) expect(contrastRatio(style[token], bg)).toBeGreaterThanOrEqual(4.5);
        }
        expect(readableToneText(colour, mode)).toBe(style['--kv-brand-fg']);
      });
    }
  }

  it('keeps the 55% mix when it already passes (the default brand in dark mode)', () => {
    // Stepping only starts when the theme.css mix fails, so defaults look the same as before.
    const dark = readableToneText('#6366f1', 'dark');
    expect(contrastRatio(dark, '#0b111e')).toBeGreaterThanOrEqual(4.5);
    expect(dark).not.toBe('#ffffff');
  });

  it('picks a dark label on light fills and white on dark ones', () => {
    for (const [colour, label] of [
      ['#ffff00', '#141428'],
      ['#00ffff', '#141428'],
      ['#111111', '#ffffff'],
      ['#6366f1', '#ffffff'],
    ] as const) {
      const style = themeStyle({ accentColor: colour }) as Record<string, string>;
      expect(style['--kv-on-accent']).toBe(label);
      // #6366f1 (the KeenVector default) is 4.47:1 with white, still the better of the two.
      if (colour !== '#6366f1') expect(contrastRatio(label, colour)).toBeGreaterThanOrEqual(4.5);
    }
    // #777777 is mid-grey: neither label reaches 4.5:1, so it takes the better one.
    const grey = (themeStyle({ accentColor: '#777777' }) as Record<string, string>)['--kv-on-accent'];
    expect(contrastRatio(grey, '#777777')).toBeGreaterThanOrEqual(contrastRatio(grey === '#ffffff' ? '#141428' : '#ffffff', '#777777'));
  });

  it('checks the brand label across the whole CTA gradient', () => {
    expect(labelOn('#ffff00')).toBe('#141428');
    const style = themeStyle({ brandColor: '#ffff00', accentColor: '#111111' }) as Record<string, string>;
    expect(['#ffffff', '#141428']).toContain(style['--kv-on-brand']);
    expect((themeStyle({ brandColor: '#6366f1' }) as Record<string, string>)['--kv-on-brand']).toBe('#ffffff');
  });
});
