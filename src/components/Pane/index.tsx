import type { HTMLAttributes, ReactNode } from 'react';

export interface PaneProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Right side of the header: buttons, filters. */
  actions?: ReactNode;
  /** No body padding, for tables and lists that run edge to edge. */
  flush?: boolean;
}

/** Titled content section with an action header. */
export function Pane({ title, actions, flush, className = '', children, ...rest }: PaneProps) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-xl border border-line bg-surface text-fg ${className}`}
      {...rest}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="min-w-0 truncate text-base font-bold">{title}</h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={flush ? 'min-w-0 flex-1' : 'min-w-0 flex-1 p-5'}>{children}</div>
    </section>
  );
}
