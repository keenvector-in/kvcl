import type { ReactNode } from 'react';
import { Icon } from '../Icon/index';

export interface TopbarProps {
  title: ReactNode;
  /** Small line above the title, e.g. "Catalog / Products". */
  crumb?: ReactNode;
  /** Right side: search, notifications, account. */
  actions?: ReactNode;
  /** Shows a menu button on small screens that opens the sidebar. AppShell passes this for you. */
  onMenu?: () => void;
  className?: string;
}

/** Sticky page header: optional breadcrumb + title on the left, actions on the right. */
export function Topbar({ title, crumb, actions, onMenu, className = '' }: TopbarProps) {
  return (
    <header
      className={`sticky top-0 z-40 flex min-h-[62px] items-center gap-4 border-b border-line bg-surface px-4 py-3 text-fg sm:px-6 ${className}`}
    >
      {onMenu ? (
        <button
          type="button"
          className="-ml-1 inline-grid size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <Icon name="menu" />
        </button>
      ) : null}
      <div className="min-w-0 grow">
        {crumb ? <div className="truncate text-xs text-fg-muted">{crumb}</div> : null}
        <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
