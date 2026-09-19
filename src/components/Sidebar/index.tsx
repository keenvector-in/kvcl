import type { ReactNode } from 'react';

export interface SidebarItem<K extends string = string> {
  key: K;
  label: ReactNode;
  icon?: ReactNode;
  /** Attention count (orders to ship, low-stock items). Hidden when 0. */
  count?: number;
}

export interface SidebarGroup<K extends string = string> {
  /** Small uppercase group heading. Omit for an ungrouped block. */
  label?: string;
  items: SidebarItem<K>[];
}

export interface SidebarProps<K extends string = string> {
  /** Product or store name. */
  brand: ReactNode;
  /** Line under the brand, e.g. "Admin console". */
  subtitle?: ReactNode;
  /** Content of the square brand mark, usually the first letter. */
  mark?: ReactNode;
  groups: SidebarGroup<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
  /** Bottom area: signed-in user, logout. */
  footer?: ReactNode;
  /** Accessible name of the navigation. Default "Main". */
  label?: string;
  className?: string;
}

const linkBase =
  'flex w-full items-center gap-2.5 border-l-[3px] px-5 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400';

/** Admin navigation column: brand head, grouped links, footer slot. Place it in `AppShell`. */
export function Sidebar<K extends string>({
  brand,
  subtitle,
  mark,
  groups,
  activeKey,
  onSelect,
  footer,
  label = 'Main',
  className = '',
}: SidebarProps<K>) {
  return (
    <aside
      className={`sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-rail-line bg-rail text-rail-fg ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-rail-line px-5 py-4">
        {mark ? (
          <span
            className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-logo-from via-logo-via to-logo-to font-extrabold text-white"
            aria-hidden="true"
          >
            {mark}
          </span>
        ) : null}
        <div className="min-w-0">
          <b className="block truncate text-lg font-semibold tracking-tight text-white">{brand}</b>
          {subtitle ? (
            <small className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-rail-fg/60">
              {subtitle}
            </small>
          ) : null}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto pb-8 pt-3" aria-label={label}>
        {groups.map((g, gi) => (
          <div key={g.label ?? gi}>
            {g.label ? (
              <div className="px-5 pb-1.5 pt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-rail-fg/55">
                {g.label}
              </div>
            ) : null}
            {g.items.map((it) => {
              const active = it.key === activeKey;
              return (
                <button
                  key={it.key}
                  type="button"
                  className={`${linkBase} ${
                    active
                      ? 'border-brand-400 bg-gradient-to-r from-brand-500/30 to-transparent text-white'
                      : 'border-transparent text-rail-fg hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelect(it.key)}
                >
                  {it.icon ? (
                    <span className="flex-none opacity-85" aria-hidden="true">
                      {it.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{it.label}</span>
                  {it.count ? (
                    <span className="ml-auto rounded-full bg-warm-500 px-[7px] py-px text-[10px] font-extrabold text-white">
                      {it.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {footer ? <div className="border-t border-rail-line p-4">{footer}</div> : null}
    </aside>
  );
}
