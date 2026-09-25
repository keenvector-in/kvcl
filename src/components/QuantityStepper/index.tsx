import { Minus, Plus } from 'lucide-react';

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  /** Default 1. Reaching it does not remove the line — wire `onRemove` for that. */
  min?: number;
  /** Stock ceiling; the + button disables at it. */
  max?: number;
  /** Disables both buttons while a quantity change is in flight. */
  busy?: boolean;
  /** Called instead of going below `min`, e.g. to drop a cart line. */
  onRemove?: () => void;
  size?: 'sm' | 'md';
  /** Accessible name, e.g. the product title. */
  label?: string;
  className?: string;
}

/** − n + for a cart line or a product page. Server owns the total; this only reports intent. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  busy = false,
  onRemove,
  size = 'md',
  label = 'Quantity',
  className = '',
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  const btn = `grid place-items-center text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent ${
    size === 'sm' ? 'size-8' : 'size-10'
  }`;
  const down = () => (atMin ? onRemove?.() : onChange(value - 1));
  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-line bg-surface ${className}`}
      aria-busy={busy || undefined}
    >
      <button
        type="button"
        className={btn}
        onClick={down}
        disabled={busy || (atMin && !onRemove)}
        aria-label={atMin && onRemove ? `Remove ${label}` : `Decrease ${label}`}
      >
        <Minus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      </button>
      <span
        className={`min-w-8 text-center font-semibold tabular-nums text-fg ${size === 'sm' ? 'text-sm' : ''}`}
        aria-live="polite"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={busy || atMax} aria-label={`Increase ${label}`}>
        <Plus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      </button>
    </div>
  );
}
