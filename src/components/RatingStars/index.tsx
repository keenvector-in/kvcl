import { useRef, type KeyboardEvent } from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  /** 0–5; halves and tenths draw a partly filled star. From the API (catalog's rating_avg) or the picker. */
  value: number;
  /** Makes it a 1–5 picker: a radio group, arrow keys move, each star is labelled "N stars". */
  onChange?: (value: number) => void;
  /** Ratings behind the average, shown as "(12)". Display mode only. */
  count?: number;
  /** Star size in px; default 16 (display) / 28 (picker). */
  size?: number;
  /** Accessible name of the picker; default "Your rating". */
  label?: string;
  className?: string;
}

const STARS = [1, 2, 3, 4, 5];

function StarGlyph({ fill, size }: { fill: number; size: number }) {
  // Two stacked glyphs: the outline, and the filled one clipped to `fill` (0..1) of its width.
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <Star size={size} className="absolute inset-0 text-line-strong" strokeWidth={1.5} />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.round(fill * 100)}%` }}>
        <Star size={size} className="fill-warm-500 text-warm-500" strokeWidth={1.5} />
      </span>
    </span>
  );
}

/**
 * Star rating: shows an average from the API, or (with `onChange`) lets a shopper pick 1–5.
 * Display mode never invents a rating — render it only when the API returned a count above zero.
 */
export function RatingStars({ value, onChange, count, size, label = 'Your rating', className = '' }: RatingStarsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!onChange) {
    const v = Math.max(0, Math.min(5, value));
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span className="inline-flex" role="img" aria-label={`Rated ${v.toFixed(1)} out of 5${count !== undefined ? `, ${count} rating${count === 1 ? '' : 's'}` : ''}`}>
          {STARS.map((s) => <StarGlyph key={s} size={size ?? 16} fill={Math.max(0, Math.min(1, v - s + 1))} />)}
        </span>
        {count !== undefined && <span className="text-xs text-fg-muted" aria-hidden="true">({count})</span>}
      </span>
    );
  }

  const pick = (s: number) => {
    onChange(s);
    refs.current[s - 1]?.focus();
  };
  const onKey = (e: KeyboardEvent, s: number) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? Math.min(5, s + 1)
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? Math.max(1, s - 1) : 0;
    if (next) {
      e.preventDefault();
      pick(next);
    }
  };
  // Roving tabindex: the chosen star (or the first) is the one Tab lands on.
  const focusable = value >= 1 ? value : 1;
  return (
    <span role="radiogroup" aria-label={label} className={`inline-flex gap-1 ${className}`}>
      {STARS.map((s) => (
        <button
          key={s}
          ref={(el) => { refs.current[s - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s === 1 ? '' : 's'}`}
          tabIndex={s === focusable ? 0 : -1}
          onClick={() => pick(s)}
          onKeyDown={(e) => onKey(e, s)}
          className="rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          <StarGlyph size={size ?? 28} fill={s <= value ? 1 : 0} />
        </button>
      ))}
    </span>
  );
}
