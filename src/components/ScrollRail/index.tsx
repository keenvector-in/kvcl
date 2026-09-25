import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ScrollRailProps {
  children: ReactNode;
  /** Heading above the rail. */
  title?: ReactNode;
  /** Link or button on the right of the heading ("See all"). */
  action?: ReactNode;
  /** Hides the arrow buttons; the rail still scrolls and snaps. */
  arrows?: boolean;
  /** Gap between items, in the Tailwind gap scale. Default 4 (16px). */
  gap?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** Accessible name when there is no visible title. */
  label?: string;
}

const GAP = { 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6' } as const;

/**
 * A horizontal row that scrolls and snaps — category tiles, product cards, filter chips.
 * Keeps the native scrollbar behaviour (drag, wheel, swipe, keyboard) and adds arrows on
 * pointer devices; the edges fade so it reads as "there is more this way".
 */
export function ScrollRail({ children, title, action, arrows = true, gap = 4, className = '', label }: ScrollRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<{ start: boolean; end: boolean }>({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAt({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  const page = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  const arrow = 'grid size-9 place-items-center rounded-full border border-line bg-surface text-fg-muted shadow-soft transition hover:text-fg disabled:opacity-0 disabled:pointer-events-none';
  return (
    <section className={className} aria-label={label}>
      {title || action || arrows ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h2 className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">{title}</h2> : <span />}
          <div className="flex items-center gap-2">
            {action}
            {arrows ? (
              <div className="hidden gap-1.5 sm:flex">
                <button type="button" className={arrow} onClick={() => page(-1)} disabled={at.start} aria-label="Scroll left">
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" className={arrow} onClick={() => page(1)} disabled={at.end} aria-label="Scroll right">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div
        ref={ref}
        onScroll={measure}
        className={`-mx-4 flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${GAP[gap]} [&>*]:snap-start motion-reduce:scroll-auto`}
      >
        {children}
      </div>
    </section>
  );
}
