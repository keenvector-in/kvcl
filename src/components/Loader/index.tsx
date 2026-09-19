/**
 * KeenPlaza's loading state: the Arcade mark with its bays lighting one after another,
 * left to right (brand/loader.svg). Under `prefers-reduced-motion` it holds still with the
 * centre bay lit, so the mark is never mid-blink.
 *
 * Use it where a whole page, a checkout or a card is waiting. `Spinner` stays the neutral,
 * brand-free option for KeenVector surfaces.
 */
export interface LoaderProps {
  /** px, default 48. 96 for a page, 40 inline, 24 next to a field. */
  size?: number;
  /** Line under the mark, e.g. "Lighting up the stores…". */
  message?: string;
  /** Screen-reader name when there is no visible message. Default "Loading". */
  label?: string;
  className?: string;
}

export function Loader({ size = 48, message, label = 'Loading', className = '' }: LoaderProps) {
  return (
    <div className={`grid justify-items-center gap-3 ${className}`} role="status" aria-label={message ? undefined : label}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="kp-loader-tile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6a4bff" />
            <stop offset="1" stopColor="#3a239a" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill="url(#kp-loader-tile)" />
        <rect x="5" y="10" width="38" height="3.2" rx="1.6" fill="#fff" />
        <path d="M7 16h34v23H7Z" fill="#fff" />
        <path d="M10.5 39V29a3.5 3.5 0 0 1 7 0v10Z" className="fill-[#3a239a] animate-kp-lit motion-reduce:animate-none" />
        <path
          d="M20.5 39V29a3.5 3.5 0 0 1 7 0v10Z"
          className="fill-[#3a239a] animate-kp-lit [animation-delay:.2s] motion-reduce:animate-none motion-reduce:fill-[#FF7A2F]"
        />
        <path d="M30.5 39V29a3.5 3.5 0 0 1 7 0v10Z" className="fill-[#3a239a] animate-kp-lit [animation-delay:.4s] motion-reduce:animate-none" />
      </svg>
      {message ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">{message}</p> : null}
    </div>
  );
}
