import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onSelect'> {
  children: ReactNode;
  /** Pressed state: the filter or category this chip stands for is on. */
  selected?: boolean;
  /** Leading icon or dot. */
  icon?: ReactNode;
  /** Count after the label, e.g. the number of matches. */
  count?: number;
  /** Shows an × next to the label and calls this. The chip then renders as two real buttons. */
  onRemove?: () => void;
  /** Accessible name for the × when the label isn't a plain string ("Remove category Cookware"). */
  removeLabel?: string;
}

/**
 * One filter, facet or category, as a pill. A row of them is the fastest filter UI on a phone:
 * tappable, scannable, and it says what is on without opening anything.
 */
export function Chip({ children, selected = false, icon, count, onRemove, removeLabel, className = '', ...rest }: ChipProps) {
  const base =
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:pointer-events-none disabled:opacity-50';
  const tone = selected
    ? 'border-brand-500 bg-brand-500 text-on-brand'
    : 'border-line bg-surface text-fg-muted hover:border-brand-400 hover:text-fg';
  const body = (
    <>
      {icon ? <span aria-hidden="true" className="flex-none [&>svg]:h-4 [&>svg]:w-4">{icon}</span> : null}
      {children}
      {count !== undefined ? <span className="tabular-nums opacity-70">{count}</span> : null}
    </>
  );

  // A removable chip holds two actions, so it is two real buttons in one pill — nesting a button
  // inside a button is invalid, and a div with role="button" is not keyboard reachable.
  if (onRemove) {
    const { onClick, disabled, ...group } = rest;
    return (
      <span className={`${base} ${tone} gap-0 pl-3.5 pr-1 ${className}`} {...group}>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={selected}
            className="inline-flex items-center gap-1.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            {body}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 py-2">{body}</span>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'item'}`}
          className="ml-1.5 grid size-6 flex-none place-items-center rounded-full text-current opacity-70 hover:bg-fg/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </span>
    );
  }

  return (
    <button type="button" aria-pressed={selected} className={`${base} ${tone} px-3.5 py-2 ${className}`} {...rest}>
      {body}
    </button>
  );
}
