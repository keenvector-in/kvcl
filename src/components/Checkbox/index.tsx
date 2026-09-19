import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Clickable label next to the box. */
  label: ReactNode;
  /** Class for the wrapping `<label>`. */
  className?: string;
}

/** Native checkbox with its label. */
export function Checkbox({ label, className = '', ...input }: CheckboxProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-[13px] text-fg ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        {...input}
      />
      <span>{label}</span>
    </label>
  );
}
