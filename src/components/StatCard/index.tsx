import type { ReactNode } from 'react';
import { Card } from '../Card/index';

// An accent tile can't be a <Card className="bg-brand-500">: both backgrounds are utilities in the
// same layer, so the stylesheet's order decides and Card's own `bg-surface` wins. It gets Card's
// shape from its own element instead.
const accentSurface = 'rounded-2xl border border-transparent bg-brand-500 text-on-brand shadow-soft';

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  /** Change against the previous period, e.g. `{ text: '+12.1%', direction: 'up' }`. */
  delta?: { text: string; direction: 'up' | 'down' };
  /** Filled brand tile for the headline number. */
  accent?: boolean;
  /** Placeholder in place of the value while it loads. */
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  delta,
  accent = false,
  loading = false,
  className = '',
}: StatCardProps) {
  const muted = accent ? 'text-on-brand/70' : 'text-fg-subtle';
  const Surface = accent
    ? ({ children: inner }: { children: ReactNode }) => <div className={`${accentSurface} p-5 ${className}`}>{inner}</div>
    : ({ children: inner }: { children: ReactNode }) => <Card className={`p-5 ${className}`}>{inner}</Card>;
  return (
    <Surface>
      <div className="flex items-start justify-between gap-2">
        <p className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${muted}`}>{label}</p>
        {icon ? <span className={`${muted} [&>svg]:h-4 [&>svg]:w-4`}>{icon}</span> : null}
      </div>
      {loading ? (
        <div className="mt-2 h-7 w-20 animate-pulse rounded-md bg-fg/10" />
      ) : (
        <p className={`mt-2 text-2xl font-semibold tabular-nums ${accent ? 'text-on-brand' : 'text-fg'}`}>{value}</p>
      )}
      {delta ? (
        <p
          className={`mt-1 text-xs font-medium ${
            accent ? 'text-on-brand/80' : delta.direction === 'up' ? 'text-success' : 'text-danger'
          }`}
        >
          <span aria-hidden="true">{delta.direction === 'up' ? '▲' : '▼'}</span> {delta.text}
        </p>
      ) : null}
      {hint ? <p className={`mt-1 text-xs ${muted}`}>{hint}</p> : null}
    </Surface>
  );
}
