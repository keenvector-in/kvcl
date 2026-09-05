import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-50 disabled:pointer-events-none';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-logo-from via-logo-via to-logo-to text-white shadow-soft hover:shadow-card hover:brightness-110 active:brightness-95',
  secondary: 'bg-white/5 text-ink-50 border border-white/10 hover:bg-white/10 hover:border-white/20',
  ghost: 'text-ink-200 hover:text-white hover:bg-white/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export interface ButtonOwnProps<T extends ElementType = 'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  className = '',
  as,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  return <Component className={classes} {...rest} />;
}
