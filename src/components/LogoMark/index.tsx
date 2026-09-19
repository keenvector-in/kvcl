/**
 * KeenPlaza's mark: the Arcade — a row of storefronts under one roof, centre bay lit.
 * Source of truth: `keen/plaza/brand/` (logo-mark.svg, logo-mark-light.svg, logo-glyph.svg).
 *
 * Three forms, one component:
 *  - `glyph` (default): line art in `currentColor` with the lit bay in the warm brand colour, for
 *    inline use and for the gradient tile a Sidebar or AuthLayout already draws.
 *  - `tile`: the primary mark, white arcade on the violet tile. Favicons, app icons, splash.
 *  - `light`: the same on a white tile, for light surfaces and print.
 *
 * KeenVector's own mark lives in each KeenVector app's `Logo` component.
 */
export type LogoMarkVariant = 'glyph' | 'tile' | 'light';

export interface LogoMarkProps {
  /** px, default 20 */
  size?: number;
  variant?: LogoMarkVariant;
  className?: string;
  /** Accessible name; omit when a "keenplaza" wordmark sits next to it. */
  label?: string;
}

/** Bays, left to right. The middle one is the lit shop. */
const BAYS = [
  'M10.5 39V29a3.5 3.5 0 0 1 7 0v10Z',
  'M20.5 39V29a3.5 3.5 0 0 1 7 0v10Z',
  'M30.5 39V29a3.5 3.5 0 0 1 7 0v10Z',
];

export function LogoMark({ size = 20, variant = 'glyph', className, label }: LogoMarkProps) {
  const a11y = {
    role: label ? ('img' as const) : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
  };
  if (variant === 'glyph') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" focusable="false" {...a11y}>
        <g stroke="currentColor" strokeWidth={2.6} strokeLinejoin="round">
          <path d="M5 11.6h38" />
          <path d="M8 16h32v23H8Z" />
          <path d="M13 39v-8.5a3 3 0 0 1 6 0V39M29 39v-8.5a3 3 0 0 1 6 0V39" />
        </g>
        <path d="M21.5 39V30a2.5 2.5 0 0 1 5 0v9Z" className="fill-warm-500" />
      </svg>
    );
  }
  const onLight = variant === 'light';
  const front = onLight ? '#5B3DF5' : '#fff';
  const dim = onLight ? '#d9d2ff' : '#3a239a';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" focusable="false" {...a11y}>
      {onLight ? (
        <rect x=".5" y=".5" width="47" height="47" rx="12.5" fill="#fff" stroke="#e3e0ef" />
      ) : (
        <>
          <defs>
            <linearGradient id="kp-tile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6a4bff" />
              <stop offset="1" stopColor="#3a239a" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="13" fill="url(#kp-tile)" />
        </>
      )}
      <rect x="5" y="10" width="38" height="3.2" rx="1.6" fill={front} />
      <path d="M7 16h34v23H7Z" fill={front} />
      <path d={BAYS[0]} fill={dim} />
      <path d={BAYS[1]} fill="#FF7A2F" />
      <path d={BAYS[2]} fill={dim} />
    </svg>
  );
}

export interface WordmarkProps {
  /** Shows "Buy it. Book it. One cart." under the name. */
  slogan?: boolean;
  className?: string;
}

/** The wordmark: "keen" heavy, "plaza" light in the brand colour, in the display face. */
export function Wordmark({ slogan = false, className = '' }: WordmarkProps) {
  return (
    <span className={`inline-grid gap-1 ${className}`}>
      <span className="font-display text-[1.6em] font-extrabold leading-none tracking-[-0.035em] text-current">
        keen
        <b className="font-medium [color:color-mix(in_oklab,currentColor_30%,var(--color-brand-500))]">plaza</b>
      </span>
      {slogan ? (
        <span className="text-[0.62em] font-semibold uppercase leading-none tracking-[0.16em] opacity-70">
          Buy it. Book it. One cart.
        </span>
      ) : null}
    </span>
  );
}
