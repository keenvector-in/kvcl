import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'accent'
  | 'warm'
  | 'danger'
  | 'success'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-logo-from via-logo-via to-logo-to text-white shadow-soft hover:shadow-card hover:brightness-110 active:brightness-95 active:scale-[0.98]',
  secondary: 'bg-fg/5 text-fg border border-line hover:bg-fg/10',
  ghost: 'text-fg-muted hover:text-fg hover:bg-fg/5',
  outline: 'bg-surface text-fg border border-line-strong hover:border-brand-400 hover:text-brand-500',
  accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600',
  /** The warm brand colour — KeenPlaza's orange CTA, a store's own accent. */
  warm: 'bg-warm-500 text-white shadow-soft hover:brightness-95',
  danger: 'bg-danger text-white shadow-soft hover:brightness-95',
  success: 'bg-success text-white shadow-soft hover:brightness-95',
  link: 'text-brand-500 underline underline-offset-4 hover:text-brand-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

/** `link` is text only — no box padding, so it sits inline in a sentence. */
const linkSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const spinnerSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export interface ButtonOwnProps<T extends ElementType = 'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  block?: boolean;
  /** Shows a spinner, sets `aria-busy` and stops clicks. */
  loading?: boolean;
  /** Rendered before the label (an SVG icon, usually). The spinner replaces it while `loading`. */
  icon?: ReactNode;
  /** Rendered after the label. */
  iconEnd?: ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * Render as a different element (e.g. your router's `Link`) instead of `<button>`.
   * kvcl stays router-agnostic — pass the component, not a string, so `to`/`href`/etc.
   * stay typed against whatever you pass here.
   */
  as?: T;
}

export type ButtonProps<T extends ElementType = 'button'> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

export function Button<T extends ElementType = 'button'>({
  variant = 'primary',
  size = 'md',
  block,
  loading,
  icon,
  iconEnd,
  className = '',
  children,
  as,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  const padding = variant === 'link' ? linkSizeClasses[size] : sizeClasses[size];
  const classes = `${base} ${variantClasses[variant]} ${padding} ${block ? 'w-full' : ''} ${className}`;
  // `disabled` is a real attribute only on <button>; on an `as` element aria-disabled carries it.
  const busy = loading
    ? Component === 'button'
      ? { disabled: true, 'aria-busy': true }
      : { 'aria-disabled': true, 'aria-busy': true }
    : undefined;
  return (
    <Component className={classes} {...rest} {...busy}>
      {loading ? (
        <span
          aria-hidden="true"
          className={`inline-block animate-spin rounded-full border-2 border-current/30 border-t-current ${spinnerSizeClasses[size]}`}
        />
      ) : (
        icon
      )}
      {children}
      {iconEnd}
    </Component>
  );
}
