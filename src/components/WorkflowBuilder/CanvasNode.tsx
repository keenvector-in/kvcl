import { createContext, useContext } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { AtSign, Bot, Hash, Mail, MessageCircle, MessageSquare, Pencil, Reply, Tag, Trash2, UserCog, Webhook, type LucideIcon } from 'lucide-react';
import { workflowNodeCatalog } from './catalog';
import { kindStyles } from './styles';
import type { WorkflowNode } from './types';

export type CanvasNodeType = Node<{ node: WorkflowNode }, 'wf'>;

// Edit/delete callbacks for the toolbar shown on the selected node. A context
// (not node data) so nodes stay plain data and the builder owns the behaviour.
export const NodeActionsContext = createContext<{ edit: (id: string) => void; remove: (id: string) => void } | null>(null);

const typeIcons: Record<string, LucideIcon> = {
  send_sms: MessageSquare,
  send_whatsapp: MessageCircle,
  reply: Reply,
  send_email: Mail,
  send_slack: Hash,
  send_instagram: AtSign,
  webhook_action: Webhook,
  update_contact: UserCog,
  add_tag: Tag,
  remove_tag: Tag,
  ask_ai_agent: Bot,
  ai_intent: Bot,
  verify_email: Mail,
  verify_whatsapp_number: MessageCircle,
};

const handleClass = 'h-2! w-2! border-0!';

export function CanvasNode({ data, selected }: NodeProps<CanvasNodeType>) {
  const { node } = data;
  const spec = workflowNodeCatalog[node.type];
  const kind = spec?.kind ?? 'action';
  const style = kindStyles[kind];
  const Icon = typeIcons[node.type] ?? style.icon;
  const actions = useContext(NodeActionsContext);
  const toolButton = 'flex h-6 w-6 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-500 shadow-sm hover:text-ink-900';

  return (
    <div
      className={`relative min-w-[180px] rounded-lg border-2 bg-white px-3 py-2.5 shadow-sm ${style.border} ${
        selected ? 'ring-2 ring-brand-500' : ''
      }`}
    >
      {selected && actions && (
        <div className="nodrag nopan absolute -top-3 right-2 flex gap-1">
          <button type="button" className={toolButton} title="Edit step" aria-label="Edit step" onClick={() => actions.edit(node.id)}>
            <Pencil className="h-3 w-3" aria-hidden />
          </button>
          <button type="button" className={`${toolButton} hover:text-red-600`} title="Delete step" aria-label="Delete step" onClick={() => actions.remove(node.id)}>
            <Trash2 className="h-3 w-3" aria-hidden />
          </button>
        </div>
      )}
      {kind !== 'trigger' && <Handle type="target" position={Position.Top} className={`${handleClass} bg-ink-400!`} />}

      <div className="flex items-center gap-2">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${style.bg} ${style.text}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink-900">{node.label}</p>
          <p className="truncate text-[10px] uppercase tracking-wide text-ink-400">{spec?.label ?? node.type}</p>
        </div>
      </div>

      {spec?.branching ? (
        <>
          <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className={`${handleClass} bg-emerald-500!`} />
          <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%' }} className={`${handleClass} bg-red-500!`} />
          <div className="mt-1 flex justify-between px-1 text-[9px] font-medium text-ink-400">
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
