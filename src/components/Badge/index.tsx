import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'brand' | 'accent' | 'neutral' | 'warning';

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-500/15 text-brand-200 border-brand-400/30',
  accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  neutral: 'bg-white/5 text-ink-200 border-white/10',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', className = '', children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
