import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone =
  | 'brand'
  | 'accent'
  | 'neutral'
  | 'warning'
  | 'success'
  | 'danger'
  | 'error'
  | 'info'
  | 'primary';

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-500/15 text-brand-500 border-brand-400/30',
  /** KeenPlaza's name for the brand tone. */
  primary: 'bg-brand-500/15 text-brand-500 border-brand-400/30',
  accent: 'bg-accent-500/15 text-accent-500 border-accent-500/30',
  neutral: 'bg-fg/5 text-fg-muted border-line',
  warning: 'bg-warning-soft text-warning border-warning/30',
  success: 'bg-success-soft text-success border-success/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  /** KeenPlaza's name for the danger tone. */
  error: 'bg-danger-soft text-danger border-danger/30',
  info: 'bg-info-soft text-info border-info/30',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Default `neutral`. Colour is never the only signal: the text must say the state. */
  tone?: BadgeTone;
  /** Leading dot in the tone's colour. Off by default (KeenPlaza's `.badge` look is `dot`). */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot = false, className = '', children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
