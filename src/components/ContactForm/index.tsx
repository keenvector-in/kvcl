import { useState, type FormEvent } from 'react';
import { TextArea, TextField } from '../TextField/index';
import { Select } from '../Select/index';
import { Radio } from '../Radio/index';
import { Checkbox } from '../Checkbox/index';
import { Button } from '../Button/index';
import type { StoreFormField, FormFieldType } from '../../api/storefront';

export type ContactAnswers = Record<string, string | string[]>;

export interface ContactFormProps {
  fields: StoreFormField[];
  /** Answers by field id, plus the honeypot's value (send it as `website`). Not called in preview. */
  onSubmit?: (answers: ContactAnswers, honeypot: string) => void;
  submitting?: boolean;
  /** A message from the server, shown above the button. */
  error?: string;
  submitLabel?: string;
  /** Admin preview: the form renders and can be typed into, but never submits. */
  preview?: boolean;
  /** Changing it clears the form (e.g. after a successful send). */
  resetKey?: unknown;
  className?: string;
}

/** Field types, in the order the admin's "Add field" menu lists them. */
export const FORM_FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'One choice' },
  { value: 'checkboxes', label: 'Several choices' },
];

/** The form a store has until it builds its own — the same one the server falls back to. */
export const DEFAULT_CONTACT_FIELDS: StoreFormField[] = [
  { id: 'name', type: 'name', label: 'Your name', required: true },
  { id: 'phone', type: 'phone', label: 'Phone' },
  { id: 'email', type: 'email', label: 'E-mail' },
  { id: 'message', type: 'textarea', label: 'Message', required: true },
];

export const isChoiceField = (t: FormFieldType) => t === 'select' || t === 'radio' || t === 'checkboxes';
/** Question types that take a minimum / maximum length. */
export const isTextField = (t: FormFieldType) => t === 'name' || t === 'text' || t === 'textarea';
/** The longest answer a question type takes. */
export const textCap = (t: FormFieldType) => (t === 'textarea' ? 2000 : 200);

// "At least 20 characters", "Up to 60 characters", "6 characters", "20–60 characters".
function lengthRule(f: StoreFormField): string | undefined {
  const min = f.min_length ?? 0;
  const max = f.max_length ?? 0;
  if (min && max) return min === max ? `${min} characters` : `${min}–${max} characters`;
  if (min) return `At least ${min} characters`;
  if (max) return `Up to ${max} characters`;
  return undefined;
}
const hintFor = (f: StoreFormField) => [f.help, lengthRule(f)].filter(Boolean).join(' · ') || undefined;
const wide = (t: FormFieldType) => t === 'textarea' || t === 'radio' || t === 'checkboxes';

const INPUT: Partial<Record<FormFieldType, { type: string; autoComplete?: string; inputMode?: 'tel' | 'email' | 'decimal' }>> = {
  name: { type: 'text', autoComplete: 'name' },
  email: { type: 'email', autoComplete: 'email', inputMode: 'email' },
  phone: { type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
  text: { type: 'text' },
  number: { type: 'text', inputMode: 'decimal' },
  date: { type: 'date' },
};

/** A store's Contact us form, rendered from its definition. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 98250 12345, 098250 12345, +91 98250 12345 — an Indian mobile, the only kind the server accepts. */
const indianMobile = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/[\s()-]/g, '').replace(/^(\+?91|0)(?=\d{10}$)/, ''));

/** What is wrong with one answer before it is sent, or undefined. The server checks again. */
function problemOf(f: StoreFormField, v: string | string[] | undefined): string | undefined {
  const blank = Array.isArray(v) ? v.length === 0 : !v?.trim();
  if (blank) return f.required ? `${f.label} is required` : undefined;
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (f.min_length && [...t].length < f.min_length) return `${f.label} needs at least ${f.min_length} characters`;
  if (f.type === 'email' && !EMAIL.test(t)) return 'Enter an e-mail address like name@example.in';
  if (f.type === 'phone' && !indianMobile(t)) return 'Enter a 10-digit mobile number';
  if (f.type === 'number' && !Number.isFinite(Number(t))) return `${f.label} must be a number`;
  return undefined;
}

export function ContactForm({ fields, onSubmit, submitting, error, submitLabel = 'Send message', preview, resetKey, className = '' }: ContactFormProps) {
  const [values, setValues] = useState<ContactAnswers>({});
  const [honeypot, setHoneypot] = useState('');
  // problems by field id; a field's message clears as soon as it is edited
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [lastReset, setLastReset] = useState(resetKey);
  if (resetKey !== lastReset) {
    setLastReset(resetKey);
    setValues({});
    setProblems({});
  }

  const set = (id: string, v: string | string[]) => {
    setValues((x) => ({ ...x, [id]: v }));
    setProblems(({ [id]: _, ...rest }) => rest);
  };
  const empty = (v?: string | string[]) => (Array.isArray(v) ? v.length === 0 : !v?.trim());
  // A server message that starts with a question's label ("Phone is not a phone number") belongs
  // under that question, not at the bottom of the form.
  const serverField = error ? fields.find((f) => error.startsWith(`${f.label} `)) : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (preview) return;
    const found: Record<string, string> = {};
    for (const f of fields) {
      const p = problemOf(f, values[f.id]);
      if (p) found[f.id] = p;
    }
    setProblems(found);
    if (Object.keys(found).length) return;
    const answers: ContactAnswers = {};
    for (const f of fields) if (!empty(values[f.id])) answers[f.id] = values[f.id];
    onSubmit?.(answers, honeypot);
  };

  return (
    <form onSubmit={submit} noValidate className={className}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        {fields.map((f) => {
          const err = problems[f.id] ?? (serverField?.id === f.id ? error : undefined);
          const maxLength = f.max_length || textCap(f.type);
          const label = f.required ? `${f.label} *` : f.label;
          const cls = wide(f.type) ? 'sm:col-span-2' : '';
          const v = values[f.id];
          if (f.type === 'textarea')
            return (
              <div key={f.id} className={cls}>
                <TextArea label={label} value={(v as string) ?? ''} onChange={(e) => set(f.id, e.target.value)} placeholder={f.placeholder} hint={hintFor(f)} error={err} rows={5} minLength={f.min_length} maxLength={maxLength} />
              </div>
            );
          if (f.type === 'select')
            return (
              <div key={f.id} className={cls}>
                <Select
                  label={label}
                  value={(v as string) ?? ''}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder={f.placeholder || 'Choose…'}
                  options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                  hint={f.help}
                  error={err}
                />
              </div>
            );
          if (f.type === 'radio' || f.type === 'checkboxes') {
            const picked = f.type === 'checkboxes' ? ((v as string[]) ?? []) : [];
            return (
              <fieldset key={f.id} className={`mb-4 min-w-0 border-0 p-0 ${cls}`} aria-invalid={!!err}>
                <legend className="mb-1.5 text-sm font-semibold text-fg">{label}</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {(f.options ?? []).map((o) =>
                    f.type === 'radio' ? (
                      <Radio key={o} name={`cf-${f.id}`} label={o} checked={v === o} onChange={() => set(f.id, o)} />
                    ) : (
                      <Checkbox
                        key={o}
                        label={o}
                        checked={picked.includes(o)}
                        onChange={(e) => set(f.id, e.target.checked ? [...picked, o] : picked.filter((x) => x !== o))}
                      />
                    ),
                  )}
                </div>
                {err ? <p className="mt-1 text-xs text-danger">{err}</p> : f.help ? <p className="mt-1 text-xs text-fg-subtle">{f.help}</p> : null}
              </fieldset>
            );
          }
          const input = INPUT[f.type] ?? { type: 'text' };
          return (
            <div key={f.id} className={cls}>
              <TextField
                label={label}
                type={input.type}
                autoComplete={input.autoComplete}
                inputMode={input.inputMode}
                value={(v as string) ?? ''}
                onChange={(e) => set(f.id, e.target.value)}
                placeholder={f.placeholder}
                hint={hintFor(f)}
                error={err}
                minLength={isTextField(f.type) ? f.min_length : undefined}
                maxLength={isTextField(f.type) ? maxLength : 200}
              />
            </div>
          );
        })}
      </div>
      {/* Honeypot: off-screen, out of the tab order and hidden from screen readers. */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {error && !serverField ? (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={submitting} disabled={preview} title={preview ? 'Preview — this form does not send' : undefined}>
        {submitLabel}
      </Button>
    </form>
  );
}
