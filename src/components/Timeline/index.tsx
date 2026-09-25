import type { ReactNode } from 'react';

export interface TimelineEntry {
  /** Stable key. */
  id: string;
  /** What happened: "Packed", "Payment captured". */
  title: ReactNode;
  /** When, already formatted — the component never guesses a locale. */
  time?: ReactNode;
  /** Who did it, a note, a location. */
  meta?: ReactNode;
  /** Icon inside the dot; defaults to a filled dot. */
  icon?: ReactNode;
  /** Tone of the dot. `muted` is a step that hasn't happened yet. */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'muted';
}

export interface TimelineProps {
  entries: TimelineEntry[];
  /** Index of the current step; it is emphasised and the rail stops there. */
  currentIndex?: number;
  /** Tighter rows for a side panel. */
  size?: 'sm' | 'md';
  className?: string;
  /** Draws the rail and fades the rows in on mount. */
  animate?: boolean;
}

const DOT: Record<NonNullable<TimelineEntry['tone']>, string> = {
  brand: 'bg-brand-500 text-on-brand',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  muted: 'bg-sunken text-fg-subtle ring-1 ring-line',
};

/**
 * What happened to this thing, in order: an order's status history, a shipment's scans, an audit
 * trail. Oldest first — a timeline that reads bottom-up makes people re-read it.
 */
export function Timeline({ entries, currentIndex, size = 'md', className = '', animate = false }: TimelineProps) {
  const pad = size === 'sm' ? 'gap-3 pb-4' : 'gap-4 pb-6';
  return (
    <ol className={`relative ${className}`}>
      {entries.map((e, i) => {
        const current = currentIndex === i;
        const tone = e.tone ?? (currentIndex === undefined || i <= (currentIndex ?? 0) ? 'brand' : 'muted');
        const last = i === entries.length - 1;
        return (
          <li
            key={e.id}
            className={`relative flex ${pad} ${last ? 'pb-0' : ''} ${
              animate ? 'animate-[kv-step_.3s_ease-out_both] motion-reduce:animate-none' : ''
            }`}
            style={animate ? { animationDelay: `${Math.min(i * 40, 200)}ms` } : undefined}
          >
            {!last ? (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 bottom-0 w-px ${tone === 'muted' ? 'bg-line' : 'bg-line-strong'}`}
              />
            ) : null}
            <span className={`relative z-[1] grid size-6 flex-none place-items-center rounded-full text-[11px] ${DOT[tone]}`}>
              {e.icon ?? <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className={`min-w-0 flex-1 ${size === 'sm' ? 'text-sm' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <b className={current ? 'text-fg' : 'font-semibold text-fg-muted'}>{e.title}</b>
                {e.time ? <span className="text-xs tabular-nums text-fg-subtle">{e.time}</span> : null}
              </div>
              {e.meta ? <p className="mt-0.5 text-xs text-fg-muted">{e.meta}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
