import { useCallback, useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

/**
 * Colour mode for a console: light, dark, or follow the OS (the default). The
 * choice is per browser (localStorage `kv_mode`) and applied as `data-kv-mode`
 * on <html>, which is what kvcl's tokens (theme.css) switch on. Call
 * `applyStoredColorMode()` before the first render to avoid a flash.
 */
export type ColorMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'kv_mode';
const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

function readStored(): ColorMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    // storage blocked: fall through
  }
  return 'system';
}

function resolve(mode: ColorMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  return media()?.matches ? 'dark' : 'light';
}

function apply(mode: ColorMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.kvMode = resolve(mode);
}

/** Apply the saved mode immediately (before React mounts). */
export function applyStoredColorMode() {
  apply(readStored());
}

export function useColorMode(): [ColorMode, (m: ColorMode) => void] {
  const [mode, setModeState] = useState<ColorMode>(readStored);
  useEffect(() => {
    apply(mode);
    if (mode !== 'system') return;
    const mq = media();
    if (!mq) return;
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);
  const setMode = useCallback((m: ColorMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // storage blocked: still apply for this session
    }
    setModeState(m);
  }, []);
  return [mode, setMode];
}

const order: ColorMode[] = ['light', 'dark', 'system'];
const icons = { light: Sun, dark: Moon, system: Monitor } as const;
const labels = { light: 'Light', dark: 'Dark', system: 'System' } as const;

export interface ColorModeToggleProps {
  className?: string;
  /** Show the mode name next to the icon. */
  showLabel?: boolean;
}

/** One button that cycles light → dark → system. */
export function ColorModeToggle({ className = '', showLabel = false }: ColorModeToggleProps) {
  const [mode, setMode] = useColorMode();
  const Icon = icons[mode];
  const next = order[(order.indexOf(mode) + 1) % order.length];
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Theme: ${labels[mode]}. Switch to ${labels[next]}`}
      title={`Theme: ${labels[mode]} (click for ${labels[next]})`}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-fg-muted hover:bg-fg/5 hover:text-fg ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {showLabel && <span>{labels[mode]}</span>}
    </button>
  );
}
