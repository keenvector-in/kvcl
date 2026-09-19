import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
/** Kept for the original kvcl `useToast().show(message, tone)` API. */
export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  /** Default `success`. */
  type?: ToastType;
  /** Milliseconds on screen. Default 2600. */
  duration?: number;
}

interface Item {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
}

// One module-level store for both APIs: toast() works from anywhere (mutation callbacks, plain
// functions) and useToast().show() feeds the same queue.
let items: Item[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const set = (next: Item[]) => {
  items = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

/** Show a short confirmation or error. Needs one `<Toaster />` (or `<ToastProvider>`) mounted. */
export function toast(message: string, typeOrOptions: ToastType | ToastOptions = 'success'): void {
  const { type = 'success', duration = 2600 } = typeof typeOrOptions === 'string' ? { type: typeOrOptions } : typeOrOptions;
  const id = ++seq;
  set([...items, { id, message, type, leaving: false }]);
  setTimeout(() => {
    set(items.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => set(items.filter((t) => t.id !== id)), 200); // matches the leave transition
  }, duration);
}

const GLYPH: Record<ToastType, string> = { success: '✓', error: '!', info: 'i', warning: '!' };
const GLYPH_BG: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-info',
  warning: 'bg-warning',
};

/** Renders queued toasts bottom-right. Mount once, near the app root. */
export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => items,
  );
  return createPortal(
    <div className="pointer-events-none fixed right-5 bottom-5 z-[1200] flex flex-col gap-2" aria-live="polite" aria-relevant="additions">
      {list.map((t) => (
        <div
          key={t.id}
          role={t.type === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex max-w-[360px] min-w-[270px] items-start gap-3 rounded-xl border border-line-strong bg-surface-2 px-4 py-3 text-sm text-fg shadow-card backdrop-blur-sm transition-all duration-200 starting:translate-y-3.5 starting:opacity-0 ${
            t.leaving ? 'translate-y-2 opacity-0' : ''
          }`}
        >
          <span className={`grid size-5 flex-none place-items-center rounded-full text-[12px] font-extrabold text-white ${GLYPH_BG[t.type]}`} aria-hidden="true">
            {GLYPH[t.type]}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Wrap the app once; call useToast() anywhere below it to show a toast. Also mounts the `<Toaster />`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const show = useCallback((message: string, tone: ToastTone = 'info') => toast(message, { type: tone, duration: 5000 }), []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
