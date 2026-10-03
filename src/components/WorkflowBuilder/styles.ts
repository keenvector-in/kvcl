import {
  AtSign, BookmarkMinus, ChartNoAxesColumn, BotMessageSquare, BrainCircuit, CalendarClock, CircleCheck, ClipboardList, Clock, CreditCard, Database,
  Flag, GitBranch, Globe, Hash, Hourglass, IndianRupee, Mail, MailCheck, Megaphone, MessageCircle, MessageSquare, MessageSquareText,
  Plug, Reply, ScanSearch, Send, ShieldCheck, Sparkles, Split, Tag, UserCog, UserPlus, Webhook, Zap, type LucideIcon,
} from 'lucide-react';
import type { WorkflowNodeKind } from './catalog';

/** Per-kind colors, shared by canvas nodes and palette dots. */
export const kindStyles: Record<WorkflowNodeKind, { border: string; bg: string; text: string; dot: string; icon: LucideIcon }> = {
  trigger: { border: 'border-blue-400/60', bg: 'bg-blue-500/12', text: 'text-blue-600 dark:text-blue-300', dot: 'bg-blue-500', icon: Zap },
  action: { border: 'border-indigo-400/60', bg: 'bg-indigo-500/12', text: 'text-indigo-600 dark:text-indigo-300', dot: 'bg-indigo-500', icon: Send },
  logic: { border: 'border-amber-400/60', bg: 'bg-amber-500/12', text: 'text-amber-600 dark:text-amber-300', dot: 'bg-amber-500', icon: GitBranch },
  timing: { border: 'border-purple-400/60', bg: 'bg-purple-500/12', text: 'text-purple-600 dark:text-purple-300', dot: 'bg-purple-500', icon: Clock },
  integration: { border: 'border-teal-400/60', bg: 'bg-teal-500/12', text: 'text-teal-600 dark:text-teal-300', dot: 'bg-teal-500', icon: Plug },
  end: { border: 'border-line-strong', bg: 'bg-sunken', text: 'text-fg-muted', dot: 'bg-ink-400', icon: CircleCheck },
};

/** One icon per step type, shared by the palette and the canvas so both always match. */
export const typeIcons: Record<string, LucideIcon> = {
  incoming_message: MessageSquareText,
  webhook_trigger: Webhook,
  contact_created: UserPlus,
  campaign_started: Megaphone,
  payment_received: IndianRupee,
  form_submitted: ClipboardList,
  chatbot_message: BotMessageSquare,
  reply: Reply,
  send_sms: MessageSquare,
  send_whatsapp: MessageCircle,
  send_email: Mail,
  send_slack: Hash,
  send_instagram: AtSign,
  ask_ai_agent: Sparkles,
  campaign_details: ChartNoAxesColumn,
  webhook_action: Webhook,
  update_contact: UserCog,
  add_tag: Tag,
  remove_tag: BookmarkMinus,
  condition: GitBranch,
  branch: Split,
  ai_intent: BrainCircuit,
  capture_contact: ScanSearch,
  verify_email: MailCheck,
  verify_whatsapp_number: ShieldCheck,
  end: Flag,
  wait: Hourglass,
  delay_until: CalendarClock,
  http_request: Globe,
  payment_check: CreditCard,
  crm_update: Database,
};

