import { CircleCheck, Clock, GitBranch, Plug, Send, Zap, type LucideIcon } from 'lucide-react';
import type { WorkflowNodeKind } from './catalog';

/** Per-kind colors, shared by canvas nodes and palette dots. */
export const kindStyles: Record<WorkflowNodeKind, { border: string; bg: string; text: string; dot: string; icon: LucideIcon }> = {
  trigger: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: Zap },
  action: { border: 'border-indigo-300', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', icon: Send },
  logic: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: GitBranch },
  timing: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', icon: Clock },
  integration: { border: 'border-teal-300', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', icon: Plug },
  end: { border: 'border-ink-300', bg: 'bg-ink-50', text: 'text-ink-500', dot: 'bg-ink-400', icon: CircleCheck },
};
