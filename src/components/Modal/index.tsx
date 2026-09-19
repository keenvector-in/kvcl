import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useOverlay } from '../../hooks/useOverlay';

export interface ModalProps {
  /** Dialog heading; also its accessible name. */
  title: ReactNode;
  /** Called on Escape, the close button and (unless disabled) a backdrop click. */
  onClose: () => void;
  children: ReactNode;
  /** Action row, right-aligned (put the primary action last). */
  footer?: ReactNode;
  /** Width 460 / 720 / 980px. Default `md`. Full screen on phones. */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum width in px, for a width between the sizes. */
  width?: number;
  /** Default true. Turn off for forms where a stray click would lose input. */
  closeOnBackdrop?: boolean;
  className?: string;
}

const widthClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-[min(460px,calc(100%-32px))] max-[560px]:mx-auto max-[560px]:mt-[18vh] max-[560px]:h-auto max-[560px]:max-h-[calc(100%-32px)] max-[560px]:w-[calc(100%-32px)]',
  md: 'w-[min(720px,calc(100%-32px))] max-[560px]:m-0 max-[560px]:h-full max-[560px]:max-h-full max-[560px]:w-full max-[560px]:rounded-none',
  lg: 'w-[min(980px,calc(100%-32px))] max-[560px]:m-0 max-[560px]:h-full max-[560px]:max-h-full max-[560px]:w-full max-[560px]:rounded-none',
};

/**
 * Centered dialog. Render it to open it, stop rendering it to close it.
 * Rendered into `document.body`; Escape closes; page scroll locks; focus moves in and back out.
 */
export function Modal({ title, onClose, children, footer, size = 'md', width, closeOnBackdrop = true, className = '' }: ModalProps) {
  const ref = useOverlay<HTMLDivElement>(true, onClose);
  const titleId = useId();
  const effectiveSize = width && width > 720 ? 'lg' : size;
  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-ink-950/45 backdrop-blur-[3px] transition-opacity duration-200 starting:opacity-0"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={width ? { maxWidth: width } : undefined}
        className={`relative mx-auto my-[5vh] flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-surface text-fg shadow-card transition-all duration-200 starting:translate-y-3 starting:scale-[0.98] starting:opacity-0 ${widthClasses[effectiveSize]} ${className}`}
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
          <div className="flex justify-end gap-3 border-t border-line bg-surface-2 px-5 py-4 max-[560px]:flex-col-reverse max-[560px]:items-stretch max-[560px]:[&>*]:w-full">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
