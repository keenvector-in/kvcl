import { useEffect, type CSSProperties, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';
export type ThemeFont = 'inter' | 'poppins' | 'playfair' | 'system';

/** A tenant's branding. Declarative data only — colours, a mode and a font
 * from a closed set. There is no CSS or class string a tenant can inject. */
export interface TenantTheme {
  brandColor: string;
  accentColor: string;
  mode: ThemeMode;
  font: ThemeFont;
}

export const defaultTheme: TenantTheme = {
  brandColor: '#6366f1',
  accentColor: '#14b8a6',
  mode: 'dark',
  font: 'inter',
};

export const themeFonts: Record<ThemeFont, { label: string; stack: string; googleFamily?: string }> = {
  inter: { label: 'Inter', stack: '"Inter", ui-sans-serif, system-ui, sans-serif', googleFamily: 'Inter:wght@400;500;600;700' },
  poppins: { label: 'Poppins', stack: '"Poppins", ui-sans-serif, system-ui, sans-serif', googleFamily: 'Poppins:wght@400;500;600;700' },
  playfair: {
    label: 'Playfair Display',
    stack: '"Playfair Display", ui-serif, Georgia, serif',
    googleFamily: 'Playfair+Display:wght@500;600;700',
  },
  system: { label: 'System', stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
};

const hexRe = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string): boolean {
  return hexRe.test(value);
}

/** CSS variables for a theme. Invalid colours are skipped, so a bad value
 * falls back to the KeenVector default instead of breaking the page. */
export function themeStyle(theme: Partial<TenantTheme>): CSSProperties {
  const vars: Record<string, string> = {};
  const brand = theme.brandColor && isHexColor(theme.brandColor) ? theme.brandColor : undefined;
  const accent = theme.accentColor && isHexColor(theme.accentColor) ? theme.accentColor : undefined;
  if (brand) {
    vars['--kv-brand'] = brand;
    vars['--kv-gradient-from'] = `color-mix(in oklab, ${brand} 85%, black)`;
    vars['--kv-gradient-via'] = brand;
    vars['--kv-gradient-to'] = accent ? `color-mix(in oklab, ${brand} 55%, ${accent})` : brand;
  }
  if (accent) vars['--kv-accent'] = accent;
  const font = theme.font ? themeFonts[theme.font] : undefined;
  if (font) vars['--kv-font'] = font.stack;
  return vars as CSSProperties;
}

export interface ThemeProviderProps {
  theme: Partial<TenantTheme>;
  children: ReactNode;
  className?: string;
}

/** Re-skins everything below it: brand/accent scales, CTA gradient, font and
 * light/dark surfaces. Scoped to its own element, so a preview can sit inside
 * a differently themed console. */
export function ThemeProvider({ theme, children, className = '' }: ThemeProviderProps) {
  const family = theme.font ? themeFonts[theme.font]?.googleFamily : undefined;

  useEffect(() => {
    if (!family) return;
    const id = `kv-font-${family.split(':')[0]}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    document.head.appendChild(link);
  }, [family]);

  return (
    <div data-kv-mode={theme.mode ?? 'dark'} style={themeStyle(theme)} className={`bg-page font-sans text-fg ${className}`}>
      {children}
    </div>
  );
}
