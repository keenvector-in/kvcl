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

// --- Contrast maths (WCAG 2 relative luminance; oklab mixing as CSS color-mix does) ---
type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const rgbToHex = (c: RGB) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const toLin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const fromLin = (v: number) => 255 * Math.min(1, Math.max(0, v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055));
function toOklab(c: RGB): RGB {
  const [r, g, b] = c.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q];
}
function fromOklab([L, a, b]: RGB): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const q = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * q),
    fromLin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * q),
    fromLin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * q),
  ];
}
/** `color-mix(in oklab, a pct, b)`. */
const mixOklab = (a: RGB, pct: number, b: RGB): RGB => {
  const [x, y] = [toOklab(a), toOklab(b)];
  return fromOklab(x.map((v, i) => v * pct + y[i] * (1 - pct)) as RGB);
};
/** `a` at `alpha` over opaque `base` (sRGB compositing, as the browser paints it). */
const over = (a: RGB, alpha: number, base: RGB): RGB => a.map((v, i) => v * alpha + base[i] * (1 - alpha)) as RGB;
const luminance = (c: RGB) => c.map(toLin).reduce((sum, v, i) => sum + [0.2126, 0.7152, 0.0722][i] * v, 0);
/** WCAG contrast ratio of two opaque colours. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(hexToRgb(a)), luminance(hexToRgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
/** Label colour on a filled brand/accent surface when white doesn't read. */
const DARK_LABEL = '#141428';

// The KeenVector surfaces of each mode, resolved to opaque colours (theme.css values;
// dark surfaces are white/black at low alpha over the page).
const LIGHT_PAGE = hexToRgb('#f8fafc'); // hsl(210 40% 98%)
const DARK_PAGE = hexToRgb('#0b111e'); // hsl(222 47% 8%)
const modeColours = {
  light: {
    fg: hexToRgb('#111827'), // hsl(222 39% 11%)
    surfaces: [LIGHT_PAGE, WHITE, hexToRgb('#f1f5f9')], // page, surface, surface-2/sunken
  },
  dark: {
    fg: WHITE,
    surfaces: [DARK_PAGE, over(WHITE, 0.03, DARK_PAGE), over(WHITE, 0.06, DARK_PAGE), over(BLACK, 0.2, DARK_PAGE)],
  },
} satisfies Record<ThemeMode, { fg: RGB; surfaces: RGB[] }>;

const minRatio = (text: RGB, backgrounds: RGB[]) => Math.min(...backgrounds.map((bg) => contrastRatio(rgbToHex(text), rgbToHex(bg))));

/** Text colour for a tone on the mode's surfaces and on the tone's own 15% tint (Badge): the tone
 * mixed with the mode's fg, starting at theme.css's 55% and stepping toward fg until every
 * background reaches 4.5:1. Pure fg always does, so this always returns. */
export function readableToneText(tone: string, mode: ThemeMode): string {
  const { fg, surfaces } = modeColours[mode];
  const c = hexToRgb(tone);
  const backgrounds = [...surfaces, ...surfaces.slice(0, 2).map((s) => over(c, 0.15, s))];
  for (let pct = 0.55; pct > 0; pct -= 0.05) {
    const text = mixOklab(c, pct, fg);
    if (minRatio(text, backgrounds) >= 4.5) return rgbToHex(text);
  }
  return rgbToHex(fg);
}

/** White or near-black, whichever reads better on every one of `fills`. */
export function labelOn(...fills: string[]): string {
  const bgs = fills.map(hexToRgb);
  return minRatio(WHITE, bgs) >= minRatio(hexToRgb(DARK_LABEL), bgs) ? '#ffffff' : DARK_LABEL;
}

/** CSS variables for a theme. Invalid colours are skipped, so a bad value
 * falls back to the KeenVector default instead of breaking the page.
 *
 * Tenant colours are arbitrary, so the text tokens are computed for them instead of the fixed
 * theme.css mixes: `--kv-on-brand` / `--kv-on-accent` (labels on filled buttons, checked across
 * the whole CTA gradient) and `--kv-brand-fg` / `--kv-accent-fg` (tone text, >=4.5:1 on the
 * mode's page, surfaces and tint).
 * ponytail: the -fg values are for `theme.mode`; a nested data-kv-mode island of the other mode
 * inside the provider inherits them. Scope a second ThemeProvider there if that ever happens. */
export function themeStyle(theme: Partial<TenantTheme>): CSSProperties {
  const vars: Record<string, string> = {};
  const brand = theme.brandColor && isHexColor(theme.brandColor) ? theme.brandColor : undefined;
  const accent = theme.accentColor && isHexColor(theme.accentColor) ? theme.accentColor : undefined;
  const mode: ThemeMode = theme.mode === 'light' ? 'light' : 'dark';
  if (brand) {
    const b = hexToRgb(brand);
    vars['--kv-brand'] = brand;
    vars['--kv-gradient-from'] = `color-mix(in oklab, ${brand} 85%, black)`;
    vars['--kv-gradient-via'] = brand;
    vars['--kv-gradient-to'] = accent ? `color-mix(in oklab, ${brand} 55%, ${accent})` : brand;
    const stops = [mixOklab(b, 0.85, BLACK), b, accent ? mixOklab(b, 0.55, hexToRgb(accent)) : b];
    vars['--kv-on-brand'] = labelOn(...stops.map(rgbToHex));
    vars['--kv-brand-fg'] = readableToneText(brand, mode);
  }
  if (accent) {
    vars['--kv-accent'] = accent;
    vars['--kv-on-accent'] = labelOn(accent);
    vars['--kv-accent-fg'] = readableToneText(accent, mode);
  }
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
