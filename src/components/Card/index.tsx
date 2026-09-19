import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section heading. With a title (or `actions`) the card grows a bordered header row. */
  title?: ReactNode;
  /** Buttons or links on the right of the header row. */
  actions?: ReactNode;
  /** Inner padding. Default true; turn it off for edge-to-edge content such as a table. */
  padded?: boolean;
  children: ReactNode;
}

const surface = 'rounded-2xl border border-line bg-surface text-fg shadow-soft backdrop-blur-sm';

export function Card({ title, actions, padded = true, children, className = '', ...rest }: CardProps) {
  if (title || actions) {
    return (
      <div className={`${surface} ${className}`} {...rest}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {typeof title === 'string' ? <h3 className="text-sm font-semibold text-fg">{title}</h3> : title}
          {actions ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
        </div>
        <div className={padded ? 'p-5' : ''}>{children}</div>
      </div>
    );
  }
  return (
    <div className={`${surface} ${padded ? 'p-6' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
