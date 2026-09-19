// KeenPlaza's brand tokens as JS values, ported from keenplaza-claude/prototype/css/global.css — not invented here.
// Prefer the Tailwind tokens from kvcl's theme.css (bg-brand-500, text-fg-muted …) in new code: they follow the
// store theme and dark mode, these constants don't. Keep both in step when the prototype changes.
export const brandColors = {
  primary: '#5B3DF5',
  primary900: '#1d1147',
  primary700: '#3a239a',
  primary100: '#ece7ff',
  primary50: '#f6f4ff',
  accent: '#FF7A2F',
  success: '#12A150',
  successBg: '#e3f8ec',
  warning: '#F5A524',
  warningBg: '#fff4e0',
  error: '#E5484D',
  errorBg: '#fdeaea',
  text: '#141428',
  textMuted: '#71718a',
  textSoft: '#a0a0b3',
  border: '#e4e4ed',
  borderStrong: '#d1d1de',
  surface: '#ffffff',
  surfaceAlt: '#fcfcfd',
  surfaceSunken: '#f0f0f5'
}

export const radius = { xs: 6, sm: 8, md: 12, lg: 16, xl: 22, full: 999 }

export const shadow = {
  xs: '0 1px 2px rgba(20,20,40,.06)',
  sm: '0 2px 6px rgba(20,20,40,.07)',
  md: '0 6px 18px rgba(20,20,40,.09)',
  lg: '0 18px 44px rgba(20,20,40,.14)'
}

/** Durations + easing (--t-fast, --t, --t-slow). Motion stays within 120–320ms and is disabled by prefers-reduced-motion in styles.css. */
export const motion = {
  fast: '120ms cubic-bezier(.4,0,.2,1)',
  base: '180ms cubic-bezier(.4,0,.2,1)',
  slow: '320ms cubic-bezier(.16,1,.3,1)'
}

export const fontFamily = '"Inter", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif'

// Deterministic placeholder art — ported from ui.js's ph(): no product photos exist yet, so a stable
// gradient + emoji per product id stands in, instead of a broken image or a stock-photo dependency.
const PALETTES: [string, string][] = [
  ['#EDE9FE', '#C4B5FD'], ['#DCFAF6', '#7DDDD3'], ['#FFE9DC', '#FFB98A'],
  ['#E4EEFF', '#9CC0FF'], ['#FDE7F3', '#F9A8D4'], ['#FEF3C7', '#FCD34D'],
  ['#E6F6EC', '#8ED9AC'], ['#EEF0F5', '#C3C8D4']
]
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
export function placeholderImage(seed: string, emoji = '🛍️'): string {
  const [a, b] = PALETTES[hashStr(seed) % PALETTES.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="480" height="480" fill="url(#g)"/>
    <circle cx="120" cy="110" r="150" fill="#ffffff" opacity=".22"/>
    <circle cx="392" cy="404" r="110" fill="#ffffff" opacity=".16"/>
    <text x="240" y="268" font-size="140" text-anchor="middle">${emoji}</text>
  </svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
