import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionProps {
  /** Always visible; clicking it opens and closes the body. */
  title: ReactNode;
  /** One line under the title, visible while closed too. */
  description?: ReactNode;
  /** Leading glyph, e.g. `<Icon name="users" size={16} />`. */
  icon?: ReactNode;
  /** Right-hand summary shown in the header — a count, a status pill. */
  meta?: ReactNode;
  defaultOpen?: boolean;
  /**
   * Accordions sharing a `group` open one at a time (native `<details name>`; browsers without it
   * simply let several open).
   */
  group?: string;
  /** `card` is a standalone panel; `plain` is a lighter row for nesting inside one. */
  variant?: 'card' | 'plain';
  children: ReactNode;
  className?: string;
}

/**
 * A section that folds away. Built on `<details>`/`<summary>`, so keyboard, screen readers and
 * find-in-page work with no script; the body stays mounted, so form state survives closing it.
 */
export function Accordion({ title, description, icon, meta, defaultOpen, group, variant = 'card', children, className = '' }: AccordionProps) {
  const card = variant === 'card';
  return (
    <details
      name={group}
      open={defaultOpen}
      className={`group/acc ${card ? 'rounded-2xl border border-line bg-surface text-fg shadow-soft' : 'rounded-xl border border-line bg-surface'} ${className}`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center gap-2.5 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400 [&::-webkit-details-marker]:hidden ${card ? 'px-5 py-4' : 'px-3 py-2.5'}`}
      >
        {icon ? (
          <span aria-hidden="true" className="grid size-7 flex-none place-items-center rounded-lg bg-brand-500/10 text-brand-500">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-bold text-fg ${card ? 'text-[0.95rem]' : 'text-sm'}`}>{title}</span>
          {description ? <span className="block truncate text-[0.8rem] font-normal text-fg-muted">{description}</span> : null}
        </span>
        {meta ? <span className="flex flex-none items-center gap-2 text-[0.8rem] text-fg-muted">{meta}</span> : null}
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 flex-none text-fg-subtle transition-transform duration-200 group-open/acc:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className={card ? 'border-t border-line px-5 pb-5 pt-4' : 'border-t border-line px-3 pb-3 pt-3'}>{children}</div>
    </details>
  );
}
