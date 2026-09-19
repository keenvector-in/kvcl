import { useId } from 'react';
import { Trash2 } from 'lucide-react';
import { workflowNodeCatalog, type WorkflowField } from './catalog';
import type { WorkflowNode } from './types';

export interface NodeConfigPanelProps {
  node: WorkflowNode;
  onChange: (patch: Partial<Pick<WorkflowNode, 'label' | 'config'>>) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

const controlClass =
  'h-9 w-full rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:bg-ink-50 disabled:text-ink-500';

function Field({ label, children }: { label: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-ink-700">
        {label}
      </label>
      {children(id)}
    </div>
  );
}

function ConfigControl({ field, value, onChange, autoFocus }: { field: WorkflowField; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <Field label={field.label}>
      {(id) =>
        field.options ? (
          <select id={id} className={controlClass} value={value} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : field.multiline ? (
          <textarea
            id={id}
            rows={4}
            autoFocus={autoFocus}
            className={`${controlClass} h-auto resize-y py-2`}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input id={id} autoFocus={autoFocus} className={controlClass} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        )
      }
    </Field>
  );
}

/** Settings for the selected node, driven entirely by its catalog spec. */
export function NodeConfigPanel({ node, onChange, onDelete, readOnly = false }: NodeConfigPanelProps) {
  const spec = workflowNodeCatalog[node.type];
  const config = node.config ?? {};

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{readOnly ? 'Step' : 'Edit step'}</p>
        <p className="text-sm font-semibold text-ink-900">{spec?.label ?? node.type}</p>
        {!readOnly && <p className="mt-1 text-xs text-ink-500">Changes apply to the draft as you type. Save draft, then Publish.</p>}
        {spec?.preview && (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
            Preview — you can design and test with this step, but it can't be published yet.
          </p>
        )}
      </div>

      <fieldset disabled={readOnly} className="m-0 flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto border-0 p-4">
        <Field label="Label">
          {(id) => <input id={id} className={controlClass} value={node.label} onChange={(e) => onChange({ label: e.target.value })} />}
        </Field>
        {spec?.fields.map((field, i) => (
          <ConfigControl
            key={`${node.id}-${field.key}`}
            autoFocus={i === 0 && !readOnly}
            field={field}
            value={config[field.key] ?? ''}
            onChange={(v) => onChange({ config: { ...config, [field.key]: v } })}
          />
        ))}
        {spec?.variables && !readOnly && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-700">Insert a variable</span>
            <div className="flex flex-wrap gap-1">
              {spec.variables.names.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange({ config: { ...config, [spec.variables!.field]: `${config[spec.variables!.field] ?? ''}{{${name}}}` } })}
                  className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[11px] text-ink-700 hover:border-brand-400 hover:text-brand-700"
                >
                  {`{{${name}}}`}
                </button>
              ))}
            </div>
          </div>
        )}
        {spec?.help && <p className="text-xs text-ink-500">{spec.help}</p>}
      </fieldset>

      {!readOnly && (
        <div className="border-t border-ink-200 p-4">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-ink-200 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete step
          </button>
        </div>
      )}
    </div>
  );
}
