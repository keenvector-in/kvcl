/** A store's theme as saved by tenant storefront settings. */
export interface StoreTheme {
  primary: string
  secondary: string
  accent: string
  corners?: 'sharp' | 'default' | 'round'
}

// Store theme maths, ported from keenplaza-claude/prototype/js/theme.js. Lives in kvcl so the
// storefront (tenant-web-portal) and the admin preview (tenant-admin-portal) derive identical tokens.

export const THEME_PRESETS: { id: string; name: string; primary: string; secondary: string; accent: string }[] = [
  { id: 'indigo', name: 'Indigo', primary: '#5B3DF5', secondary: '#0FB5A6', accent: '#FF7A2F' },
  { id: 'emerald', name: 'Emerald', primary: '#0E9F6E', secondary: '#3B82F6', accent: '#F59E0B' },
  { id: 'royal', name: 'Royal', primary: '#2563EB', secondary: '#06B6D4', accent: '#F43F5E' },
  { id: 'crimson', name: 'Crimson', primary: '#DC2626', secondary: '#7C3AED', accent: '#F59E0B' },
  { id: 'sunset', name: 'Sunset', primary: '#EA580C', secondary: '#0EA5E9', accent: '#DB2777' },
  { id: 'plum', name: 'Plum', primary: '#9333EA', secondary: '#14B8A6', accent: '#FACC15' },
  { id: 'forest', name: 'Forest', primary: '#15803D', secondary: '#CA8A04', accent: '#EA580C' },
  { id: 'midnight', name: 'Midnight', primary: '#4F46E5', secondary: '#64748B', accent: '#22D3EE' }
]

export const DEFAULT_THEME: StoreTheme = { primary: '#5B3DF5', secondary: '#0FB5A6', accent: '#FF7A2F', corners: 'default' }

const RADII = {
  sharp: { xs: '2px', sm: '3px', md: '4px', lg: '6px', xl: '8px' },
  default: { xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '22px' },
  round: { xs: '10px', sm: '14px', md: '20px', lg: '26px', xl: '32px' }
}

const isHexColor = (c: unknown): c is string => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)

export function isValidTheme(t?: StoreTheme | null): t is StoreTheme {
  return !!t && isHexColor(t.primary) && isHexColor(t.secondary) && isHexColor(t.accent) && (!t.corners || t.corners in RADII)
}

const hex2rgb = (h: string) => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgb2hex = (rgb: number[]) => '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hex2rgb(a)
  const B = hex2rgb(b)
  return rgb2hex(A.map((v, i) => v + (B[i] - v) * t))
}
const luminance = (c: string) => {
  const [r, g, b] = hex2rgb(c).map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ramp(base: string): Record<number, string> {
  return {
    50: mix(base, '#ffffff', 0.94),
    100: mix(base, '#ffffff', 0.88),
    200: mix(base, '#ffffff', 0.74),
    300: mix(base, '#ffffff', 0.55),
    400: mix(base, '#ffffff', 0.3),
    600: mix(base, '#000000', 0.14),
    700: mix(base, '#000000', 0.3),
    800: mix(base, '#000000', 0.46),
    900: mix(base, '#000000', 0.62)
  }
}

/**
 * The store's colours as kvcl theme variables (`--kv-*`), to put on the element
 * that scopes the store — every kvcl component reads the same tokens, so one
 * style object re-skins the whole storefront. Null when the theme is invalid.
 *
 * The brand ramp is derived here rather than by `color-mix` so a store's
 * lighter and darker steps stay the ones the prototype's theme.js produced.
 */
export function themeVariables(theme?: StoreTheme | null): Record<string, string> | null {
  if (!isValidTheme(theme)) return null
  const p = ramp(theme.primary)
  const [r, g, b] = hex2rgb(theme.primary)
  const vars: Record<string, string> = {
    '--kv-brand': theme.primary,
    '--kv-accent': theme.secondary,
    '--kv-warm': theme.accent,
    '--kv-gradient-from': theme.primary,
    '--kv-gradient-via': mix(theme.primary, theme.accent, 0.5),
    '--kv-gradient-to': theme.accent,
    '--kv-on-brand': luminance(theme.primary) > 0.55 ? '#141428' : '#ffffff',
    '--kv-brand-shadow': `0 8px 22px rgba(${r},${g},${b},0.28)`
  }
  Object.entries(p).forEach(([k, v]) => (vars[`--kv-brand-${k}`] = v))
  Object.entries(RADII[theme.corners ?? 'default']).forEach(([k, v]) => (vars[`--kv-radius-${k}`] = v))
  return vars
}
