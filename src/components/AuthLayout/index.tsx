import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/index';

export interface AuthBenefit {
  icon: IconName;
  text: ReactNode;
}

export interface AuthLayoutProps {
  /** Product or store name shown in the brand panel and above the form. */
  brand: ReactNode;
  /** Square mark content, usually the first letter. */
  mark?: ReactNode;
  /** Line under the brand: "Admin console", "Platform console", the store's tagline. */
  subtitle?: ReactNode;
  /** Headline in the brand panel. */
  headline: ReactNode;
  /** Three short reasons, each with an icon. */
  benefits?: AuthBenefit[];
  /** Form column title. Default "Log in". */
  title?: ReactNode;
  children: ReactNode;
  /** Under the form: legal line, help link. */
  footer?: ReactNode;
  className?: string;
}

/** Split login page: brand panel on the left, form on the right; stacks on phones. */
export function AuthLayout({
  brand,
  mark,
  subtitle,
  headline,
  benefits = [],
  title = 'Log in',
  children,
  footer,
  className = '',
}: AuthLayoutProps) {
  return (
    <div
      className={`grid min-h-screen bg-page text-fg lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${className}`}
    >
      <aside className="relative flex flex-col gap-5 overflow-hidden bg-gradient-to-br from-brand-900 via-brand-500 to-warm-500 px-5 py-8 text-white lg:gap-10 lg:px-12 lg:py-16">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-xl bg-white/20 text-lg font-extrabold backdrop-blur-sm"
            aria-hidden="true"
          >
            {mark ?? String(brand).charAt(0)}
          </span>
          <div className="min-w-0">
            <b className="block text-xl leading-tight">{brand}</b>
            {subtitle ? (
              <small className="text-[11px] uppercase tracking-[0.14em] opacity-70">{subtitle}</small>
            ) : null}
          </div>
        </div>
        <h2 className="max-w-[16ch] text-pretty text-2xl font-extrabold leading-tight tracking-tight lg:mt-auto lg:text-5xl">
          {headline}
        </h2>
        {benefits.length ? (
          <ul className="hidden max-w-[44ch] list-none gap-3 p-0 lg:grid">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm opacity-90">
                <span className="grid size-9 flex-none place-items-center rounded-xl bg-white/15">
                  <Icon name={b.icon} size={18} />
                </span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div
          className="pointer-events-none absolute -bottom-32 -right-28 hidden size-96 rounded-full bg-white/20 blur-3xl lg:block"
          aria-hidden="true"
        />
      </aside>
      <main className="grid place-items-center px-5 py-12">
        <div className="flex w-full max-w-100 flex-col gap-4">
          <h1 className="mb-2 text-2xl font-bold tracking-tight">{title}</h1>
          {children}
          {footer ? <div className="mt-4 text-xs text-fg-muted">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
