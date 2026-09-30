import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export interface TrendPoint {
  /** The x value as the API sends it, e.g. "2026-09-01". */
  x: string;
  y: number;
}

export interface TrendChartProps {
  points: TrendPoint[];
  /** Accessible name and the table's caption, e.g. "Revenue per day". */
  label: string;
  /** Formats a y value for the axis, tooltip and table (e.g. paise → "₹12,400"). */
  formatValue?: (y: number) => string;
  /** Short axis form of a y value (e.g. "₹12K"); defaults to formatValue. */
  formatTick?: (y: number) => string;
  /** Formats an x value for the axis, tooltip and table. */
  formatX?: (x: string) => string;
  height?: number;
  className?: string;
}

const PAD = { top: 12, right: 12, bottom: 26, left: 56 };

/** Round up to 1, 2, 2.5 or 5 × 10ⁿ so the top gridline is a clean number. */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = [1, 2, 2.5, 5, 10].find((s) => s * p >= v) ?? 10;
  return m * p;
}

/**
 * One series over time: a 2px line with a 10% wash, hairline grid, sparse axis labels, a crosshair
 * tooltip that follows the pointer (and the arrow keys), and a table view. No legend — the title says
 * what is plotted. Colour is the brand step validated against each surface (500 light, 400 dark).
 */
export function TrendChart({ points, label, formatValue = (y) => y.toLocaleString('en-IN'), formatTick, formatX = (x) => x, height = 220, className = '' }: TrendChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tick = formatTick ?? formatValue;
  const max = niceMax(Math.max(0, ...points.map((p) => p.y)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const xAt = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i * innerW) / (points.length - 1));
  const yAt = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(p.y).toFixed(1)}`).join(' ');
  const area = points.length ? `${line} L${xAt(points.length - 1).toFixed(1)},${yAt(0)} L${xAt(0).toFixed(1)},${yAt(0)} Z` : '';
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  // first, middle and last x labels — never one under every point
  const xLabels = points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, i) => i);

  const nearest = (clientX: number) => {
    const rect = box.current!.getBoundingClientRect();
    const x = clientX - rect.left - PAD.left;
    const i = points.length <= 1 ? 0 : Math.round((x / innerW) * (points.length - 1));
    return Math.min(points.length - 1, Math.max(0, i));
  };
  const onMove = (e: PointerEvent) => points.length && setActive(nearest(e.clientX));
  const onKey = (e: KeyboardEvent) => {
    if (!points.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((a) => Math.min(points.length - 1, Math.max(0, (a ?? (e.key === 'ArrowRight' ? -1 : points.length)) + (e.key === 'ArrowRight' ? 1 : -1))));
    }
    if (e.key === 'Escape') setActive(null);
  };
  const a = active !== null ? points[active] : null;
  const tipLeft = active !== null ? Math.min(Math.max(xAt(active), 70), width - 70) : 0;

  return (
    <div className={className}>
      <div
        ref={box}
        className="relative text-brand-500 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-lg dark:text-brand-400"
        tabIndex={0}
        role="img"
        aria-label={`${label}. Use the arrow keys to read each point.`}
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        <svg width={width} height={height} aria-hidden="true" className="block">
          {grid.map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={width - PAD.right} y1={yAt(g)} y2={yAt(g)} className="stroke-line" strokeWidth={1} />
              <text x={PAD.left - 8} y={yAt(g)} dy="0.32em" textAnchor="end" className="fill-fg-subtle text-[11px]">
                {tick(g)}
              </text>
            </g>
          ))}
          {xLabels.map((i) => (
            <text key={i} x={xAt(i)} y={height - 8} textAnchor={i === 0 && points.length > 1 ? 'start' : i === points.length - 1 && points.length > 1 ? 'end' : 'middle'} className="fill-fg-subtle text-[11px]">
              {formatX(points[i].x)}
            </text>
          ))}
          {area ? <path d={area} fill="currentColor" fillOpacity={0.1} /> : null}
          {line ? <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" /> : null}
          {a && active !== null ? (
            <g>
              <line x1={xAt(active)} x2={xAt(active)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-line-strong" strokeWidth={1} />
              <circle cx={xAt(active)} cy={yAt(a.y)} r={5} fill="currentColor" className="stroke-page" strokeWidth={2} />
            </g>
          ) : null}
        </svg>
        {a ? (
          <div
            role="status"
            className="pointer-events-none absolute top-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-card"
            style={{ left: tipLeft }}
          >
            <b className="block text-sm font-semibold text-fg tabular-nums">{formatValue(a.y)}</b>
            <span className="text-fg-muted">{formatX(a.x)}</span>
          </div>
        ) : null}
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-fg-muted hover:text-fg">Show as table</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-line">
          <table className="w-full text-left text-[0.82rem]">
            <caption className="sr-only">{label}</caption>
            <tbody>
              {points.map((p) => (
                <tr key={p.x} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-1.5 font-normal text-fg-muted">
                    {formatX(p.x)}
                  </th>
                  <td className="px-3 py-1.5 text-right tabular-nums text-fg">{formatValue(p.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
