import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SearchBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'className'> {
  value: string;
  /** Called with the new text on every keystroke. Debounce at the call site if it triggers a request. */
  onChange: (value: string) => void;
  /** Accessible name. Default "Search". */
  label?: string;
  /** Leading icon, e.g. a magnifier SVG. */
  icon?: ReactNode;
  /** Class for the wrapper. */
  className?: string;
}

/** Search input with an optional leading icon. */
export function SearchBox({
  value,
  onChange,
  label = 'Search',
  icon,
  placeholder = 'Search…',
  className = '',
  ...input
}: SearchBoxProps) {
  return (
    <div
      className={`flex h-[42px] items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400 ${className}`}
    >
      {icon ? (
        <span aria-hidden="true" className="flex flex-none items-center text-fg-subtle">
          {icon}
        </span>
      ) : null}
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-none bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
        {...input}
      />
    </div>
  );
}
