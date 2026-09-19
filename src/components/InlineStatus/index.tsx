import type { ReactNode } from 'react';

export type InlineStatusKind = 'loading' | 'empty' | 'error' | 'success';

export interface InlineStatusProps {
  kind: InlineStatusKind;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<InlineStatusKind, string> = {
  loading: 'text-fg-muted',
  empty: 'text-fg-subtle',
  error: 'text-danger',
  success: 'text-success',
};

/** One-line loading / empty / error / success message. Errors are announced as alerts, the rest politely. */
export function InlineStatus({ kind, children, className = '' }: InlineStatusProps) {
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`my-2.5 text-sm ${toneClasses[kind]} ${className}`}>
      {children}
    </p>
  );
}
