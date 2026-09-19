import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  /** Value reported to `onChange`. `key` is the KeenPlaza spelling of the same thing — pass either. */
  id?: T;
  key?: T;
  label: ReactNode;
  /** Shown as a small pill after the label when > 0. */
  count?: number;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /**
   * `underline` (default) is a tab bar for a page's sections; `segmented` is a
   * button group for filters and view modes.
   */
  variant?: 'underline' | 'segmented';
  /** Accessible name for the group, e.g. "Product editor sections". */
  label?: string;
  className?: string;
}

const idOf = <T extends string>(item: TabItem<T>) => (item.id ?? item.key) as T;

/** Tab bar for a page's sections. State (and the URL) stays with the caller. */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  label,
  className = '',
}: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const pos = enabled.indexOf(index);
    const next =
      e.key === 'ArrowRight' ? enabled[(pos + 1) % enabled.length]
      : e.key === 'ArrowLeft' ? enabled[(pos - 1 + enabled.length) % enabled.length]
      : e.key === 'Home' ? enabled[0]
      : e.key === 'End' ? enabled[enabled.length - 1]
      : undefined;
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(idOf(items[next]));
  };

  if (variant === 'segmented') {
    return (
      <div role="group" aria-label={label} className={`inline-flex gap-0.5 rounded-lg bg-sunken p-0.5 ${className}`}>
        {items.map((t) => {
          const id = idOf(t);
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              disabled={t.disabled}
              onClick={() => onChange(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${active ? 'bg-surface text-fg shadow-soft' : 'text-fg-muted hover:text-fg'}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="tablist" aria-label={label} className={`flex gap-1 overflow-x-auto border-b border-line ${className}`}>
      {items.map((t, i) => {
        const id = idOf(t);
        const active = id === value;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={t.disabled}
            onClick={() => onChange(id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${active ? 'text-brand-600 dark:text-brand-400' : 'text-fg-muted hover:text-fg'}`}
          >
            {t.label}
            {t.count ? <span className="ml-1.5 rounded-full bg-fg/10 px-1.5 text-[10px] text-fg-muted">{t.count}</span> : null}
            {active ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" /> : null}
          </button>
        );
      })}
    </div>
  );
}
