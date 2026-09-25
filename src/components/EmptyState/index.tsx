import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Emoji or SVG in the round badge above the title. Decorative. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-12 text-center ${className}`}>
      {icon ? (
        <div aria-hidden="true" className="mb-1 grid h-16 w-16 place-items-center rounded-full bg-sunken text-2xl text-fg-muted">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-medium text-fg">{title}</p>
      {/* a div: a description often carries a hint list or a status line, which cannot nest in a p */}
      {description ? <div className="text-sm text-fg-subtle">{description}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
