import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export interface IconButtonOwnProps<T extends ElementType = 'button'> {
  /** Accessible name, also the tooltip. Required: the button has no visible text. Include the count if it matters ("Cart, 3 items"). */
  label: string;
  icon: ReactNode;
  /** Small count bubble. Hidden when 0 or undefined; shows 99+ above 99. */
  count?: number;
  className?: string;
  /** Render as a different element (a router `Link`, an `a`) instead of `<button>`. */
  as?: T;
}

export type IconButtonProps<T extends ElementType = 'button'> = IconButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof IconButtonOwnProps<T> | 'children'>;

/** Round icon-only button with an optional count bubble. */
export function IconButton<T extends ElementType = 'button'>({
  label,
  icon,
  count,
  className = '',
  as,
  ...rest
}: IconButtonProps<T>) {
  const Tag = (as ?? 'button') as ElementType;
  return (
    <Tag
      type={as ? undefined : 'button'}
      aria-label={label}
      title={label}
      className={`relative inline-grid size-10 place-items-center rounded-full text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    >
      {icon}
      {count ? (
        <span
          className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-warm-500 px-1 text-[10px] font-bold text-white"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Tag>
  );
}
