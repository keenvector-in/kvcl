import { createContext, useContext } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Pencil, Trash2 } from 'lucide-react';
import { workflowNodeCatalog, type WorkflowNodeSpec } from './catalog';
import { kindStyles, typeIcons } from './styles';
import type { WorkflowNode } from './types';

export type CanvasNodeType = Node<{ node: WorkflowNode }, 'wf'>;

// Edit/delete callbacks for the toolbar shown on the selected node. A context
// (not node data) so nodes stay plain data and the builder owns the behaviour.
export const NodeActionsContext = createContext<{ edit: (id: string) => void; remove: (id: string) => void } | null>(null);


const handleClass = 'h-2.5! w-2.5! border-0!';

/** What the step does, from its own settings in field order — options by their label —
 * so the canvas reads without opening each step ("Message text · Contains · plaza"). */
function stepSummary(node: WorkflowNode, spec: WorkflowNodeSpec | undefined): string {
  if (!spec) return '';
  const config = node.config ?? {};
  return spec.fields
    .map((field) => {
      const value = config[field.key] ?? '';
      return field.options ? (field.options.find((o) => o.value === value)?.label ?? value) : value.trim();
    })
    .filter(Boolean)
    .join(' · ');
}

export function CanvasNode({ data, selected }: NodeProps<CanvasNodeType>) {
  const { node } = data;
  const spec = workflowNodeCatalog[node.type];
  const kind = spec?.kind ?? 'action';
  const style = kindStyles[kind];
  const Icon = typeIcons[node.type] ?? style.icon;
  const actions = useContext(NodeActionsContext);
  const toolButton = 'flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface text-fg-muted shadow-sm hover:text-fg';
  const summary = stepSummary(node, spec);

  return (
    <div
      className={`relative w-72 rounded-xl border-2 bg-surface px-3.5 py-3 shadow-sm ${style.border} ${
        selected ? 'ring-2 ring-brand-500' : ''
      }`}
    >
      {selected && actions && (
        <div className="nodrag nopan absolute -top-3 right-2 flex gap-1">
          <button type="button" className={toolButton} title="Edit step" aria-label="Edit step" onClick={() => actions.edit(node.id)}>
            <Pencil className="h-3 w-3" aria-hidden />
          </button>
          <button type="button" className={`${toolButton} hover:text-danger`} title="Delete step" aria-label="Delete step" onClick={() => actions.remove(node.id)}>
            <Trash2 className="h-3 w-3" aria-hidden />
          </button>
        </div>
      )}
      {kind !== 'trigger' && <Handle type="target" position={Position.Top} className={`${handleClass} bg-ink-400!`} />}

      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{node.label}</p>
          <p className="truncate text-[11px] uppercase tracking-wide text-fg-subtle">{spec?.label ?? node.type}</p>
        </div>
      </div>
      {summary && (
        // Clamp an inner span: on the padded box itself the third line shows through the padding.
        <p title={summary} className="mt-2.5 rounded-md bg-sunken px-2.5 py-1.5 text-xs leading-snug text-fg-muted">
          <span className="line-clamp-2 break-words">{summary}</span>
        </p>
      )}

      {spec?.branching ? (
        <>
          <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className={`${handleClass} bg-emerald-500!`} />
          <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%' }} className={`${handleClass} bg-red-500!`} />
          <div className="mt-1.5 flex justify-between px-1 text-[10px] font-medium text-fg-subtle">
            <span>YES</span>
            <span>NO</span>
          </div>
        </>
      ) : (
        kind !== 'end' && <Handle type="source" position={Position.Bottom} className={`${handleClass} bg-ink-400!`} />
      )}
    </div>
  );
}
