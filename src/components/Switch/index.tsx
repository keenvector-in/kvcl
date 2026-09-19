import type { InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'className'> {
  /** What the switch turns on. Always read by screen readers, even when `hideLabel` hides it visually. */
  label: string;
  hideLabel?: boolean;
  /** Class for the wrapping `<label>`. */
  className?: string;
}

/** On/off toggle: a native checkbox with `role="switch"`, so Space toggles it and `checked`/`onChange` work as usual. */
export function Switch({ label, hideLabel, className = '', ...input }: SwitchProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-[13px] text-fg ${className}`}>
      <span className="relative h-[22px] w-10 flex-none">
        <input
          type="checkbox"
          role="switch"
          className="peer relative z-[2] m-0 h-full w-full cursor-pointer opacity-0"
          {...input}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow-soft after:transition-transform after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-[18px] peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-disabled:opacity-50"
        />
      </span>
      <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
    </label>
  );
}
