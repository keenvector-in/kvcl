import type { InputHTMLAttributes, ReactNode } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  /** Clickable label next to the radio. Give radios in one group the same `name`. */
  label: ReactNode;
  /** Class for the wrapping `<label>`. */
  className?: string;
}

/** Native radio with its label. Group radios in a `<fieldset>` with a `<legend>`. */
export function Radio({ label, className = '', ...input }: RadioProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-[13px] text-fg ${className}`}>
      <input
        type="radio"
        className="h-4 w-4 cursor-pointer accent-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        {...input}
      />
      <span>{label}</span>
    </label>
  );
}
