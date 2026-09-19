import {
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

interface FieldProps {
  /** Always rendered as a `<label>`; use `hideLabel` to hide it visually. */
  label: string;
  hideLabel?: boolean;
  /** Helper text under the field, linked with `aria-describedby`. */
  hint?: ReactNode;
  /** Error text under the field. Sets `aria-invalid` and is announced. */
  error?: string;
  /** Class for the wrapper (label + input + hint). */
  className?: string;
  /**
   * Layout style for the wrapper: width, flex, margin. The wrapper has a 12px bottom margin for stacked
   * forms; pass `{ marginBottom: 0 }` when the field sits in a row with a button so their bottoms line up.
   * Every other attribute goes to the input itself.
   */
  style?: CSSProperties;
}

export interface TextFieldProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style'> {}
export interface TextAreaProps
  extends FieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> {}

const control =
  'w-full rounded-lg border bg-surface text-sm text-fg transition-colors placeholder:text-fg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

function useField(id: string | undefined, hint: ReactNode, error: string | undefined) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy =
    [hint ? `${fieldId}-hint` : '', error ? `${fieldId}-error` : ''].filter(Boolean).join(' ') || undefined;
  return { fieldId, describedBy };
}

function Frame({
  label,
  hideLabel,
  hint,
  error,
  className = '',
  style,
  fieldId,
  children,
}: FieldProps & { fieldId: string; children: ReactNode }) {
  return (
    <div className={`mb-3 flex w-full flex-col gap-1.5 ${className}`} style={style}>
      <label
        htmlFor={fieldId}
        className={hideLabel ? 'sr-only' : 'text-[13px] font-semibold text-fg-muted'}
      >
        {label}
      </label>
      {children}
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

/** Labelled text input. */
export function TextField({ label, hideLabel, hint, error, className, style, id, ...input }: TextFieldProps) {
  const { fieldId, describedBy } = useField(id, hint, error);
  return (
    <Frame
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      className={className}
      style={style}
      fieldId={fieldId}
    >
      <input
        id={fieldId}
        className={`${control} h-[42px] px-3 ${error ? 'border-danger' : 'border-line-strong'}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
    </Frame>
  );
}

/** Labelled multi-line input. */
export function TextArea({ label, hideLabel, hint, error, className, style, id, ...textarea }: TextAreaProps) {
  const { fieldId, describedBy } = useField(id, hint, error);
  return (
    <Frame
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      className={className}
      style={style}
      fieldId={fieldId}
    >
      <textarea
        id={fieldId}
        className={`${control} min-h-[88px] resize-y p-3 leading-normal ${
          error ? 'border-danger' : 'border-line-strong'
        }`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...textarea}
      />
    </Frame>
  );
}
