import type { ReactNode } from 'react';

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** Spans both columns in the two-column layout — an address, a note. */
  wide?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** `rows` is label-left/value-right (a summary panel); `grid` is two columns of pairs. */
  layout?: 'rows' | 'grid';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * The facts about a record — address, payment, dimensions, totals — as a real `<dl>`, so a screen
 * reader reads label and value as a pair instead of two loose lines.
 */
export function DescriptionList({ items, layout = 'rows', size = 'md', className = '' }: DescriptionListProps) {
  const text = size === 'sm' ? 'text-sm' : '';
  if (layout === 'grid') {
    return (
      <dl className={`grid gap-x-6 gap-y-3 sm:grid-cols-2 ${text} ${className}`}>
        {items.map((i, n) => (
          <div key={n} className={i.wide ? 'sm:col-span-2' : undefined}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{i.label}</dt>
            <dd className="mt-0.5 text-fg">{i.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={`divide-y divide-line ${text} ${className}`}>
      {items.map((i, n) => (
        <div key={n} className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
          <dt className="text-fg-muted">{i.label}</dt>
          <dd className="text-right font-medium tabular-nums text-fg">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
