import { useId, type CSSProperties, type ReactNode, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style'> {
  label: string;
  hideLabel?: boolean;
  /** Options to render. Omit and pass `<option>` children instead when you need groups. */
  options?: SelectOption[];
  /** Adds a first, empty option with this text. */
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  /** Class for the wrapper. */
  className?: string;
  /** Layout style for the wrapper (width, flex, margin); `{ marginBottom: 0 }` lines it up with a button in a row. */
  style?: CSSProperties;
}

/** Labelled native select. Native for keyboard, mobile pickers and screen readers. */
export function Select({
  label,
  hideLabel,
  options,
  placeholder,
  hint,
  error,
  className = '',
  style,
  id,
  children,
  ...select
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy =
    [hint ? `${fieldId}-hint` : '', error ? `${fieldId}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`mb-3 flex w-full flex-col gap-1.5 ${className}`} style={style}>
      <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : 'text-[13px] font-semibold text-fg-muted'}>
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          className={`h-[42px] w-full appearance-none rounded-lg border bg-surface pl-3 pr-8 text-sm text-fg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
            error ? 'border-danger' : 'border-line-strong'
          }`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...select}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
      {hint ? (
        <span id={`${fieldId}-hint`} className="text-xs text-fg-subtle">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${fieldId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
