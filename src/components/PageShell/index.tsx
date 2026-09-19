import type { ReactNode } from 'react';

export interface PageShellProps {
  title: ReactNode;
  children: ReactNode;
  /** Column max width in px. Default 420 (forms, login). */
  width?: number;
  /** Shown above the title, e.g. a brand mark. */
  header?: ReactNode;
  className?: string;
}

/** Centred single-column page for login, onboarding and simple forms. Stacks on phones without breakpoints. */
export function PageShell({ title, children, width = 420, header, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-page px-4 py-12 text-fg ${className}`}>
      <main className="mx-auto flex flex-col gap-4" style={{ maxWidth: width }}>
        {header}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
