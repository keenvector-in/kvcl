import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useOverlay } from '../../hooks/useOverlay';

export interface DrawerProps {
  /** Drawer heading; also its accessible name. */
  title: ReactNode;
  /** Called on Escape, the close button and a backdrop click. */
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Edge it slides in from. Default `right`; menus usually use `left`. */
  side?: 'left' | 'right';
  /** 720px instead of 520px. */
  wide?: boolean;
  className?: string;
}

/**
 * Full-height sheet from the screen edge: mobile menus, filters, details.
 * Render it to open it. Same Escape, scroll-lock and focus behaviour as Modal.
 */
export function Drawer({ title, onClose, children, footer, side = 'right', wide, className = '' }: DrawerProps) {
  const ref = useOverlay<HTMLDivElement>(true, onClose);
  const titleId = useId();
  return createPortal(
    <div className="fixed inset-0 z-[1001]">
      <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-[3px] transition-opacity duration-200 starting:opacity-0" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute top-0 flex h-full flex-col bg-surface text-fg shadow-card transition-transform duration-200 ${
          wide ? 'w-[min(720px,100%)]' : 'w-[min(520px,100%)]'
        } ${side === 'left' ? 'left-0 starting:-translate-x-full' : 'right-0 starting:translate-x-full'} ${className}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            data-overlay-close
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
        {footer ? (
          <div className="border-t border-line bg-surface-2 px-5 py-4 max-[560px]:flex max-[560px]:flex-col-reverse max-[560px]:items-stretch max-[560px]:[&>*]:w-full">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
