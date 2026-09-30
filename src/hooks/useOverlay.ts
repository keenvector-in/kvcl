import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Open overlays, oldest first. Only the last one reacts to Escape, so a ConfirmDialog opened over a
// Modal closes on its own and leaves the Modal open.
const stack: symbol[] = [];

/**
 * Shared behaviour for modal-like surfaces (Modal, Drawer, AppShell's small-screen sidebar):
 * Escape calls `onClose` (topmost overlay only), page scroll is locked, focus moves into the surface
 * when it opens (the `[autofocus]` element, else the first focusable that isn't marked
 * `data-overlay-close`), Tab and Shift+Tab stay inside it, and focus returns to whatever had focus
 * before when it closes.
 *
 * Attach the returned ref to the surface element; give that element `tabIndex={-1}` so it can
 * take focus when it has nothing focusable inside.
 */
export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void): RefObject<T | null> {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const id = Symbol('overlay');
    stack.push(id);
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const el = ref.current;
    if (el) {
      const all = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      const target =
        el.querySelector<HTMLElement>('[autofocus]') ?? all.find((n) => !n.hasAttribute('data-overlay-close')) ?? all[0] ?? el;
      target.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') close.current();
      // Keep Tab inside the surface: wrap from the last focusable to the first and back.
      if (e.key === 'Tab' && ref.current) {
        const surface = ref.current;
        const items = Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) {
          e.preventDefault();
          surface.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!surface.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && (active === first || active === surface)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, [open]);

  return ref;
}
