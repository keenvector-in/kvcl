export type WorkflowNodeKind = 'trigger' | 'action' | 'logic' | 'timing' | 'integration' | 'end';

export interface WorkflowFieldOption {
  value: string;
  label: string;
}

export interface WorkflowField {
  key: string;
  label: string;
  placeholder?: string;
  /** Render a textarea instead of a single-line input. */
  multiline?: boolean;
  /** Renders a select instead of a text input. */
  options?: WorkflowFieldOption[];
  /** Shown only while the node's config[key] equals `equals`. */
  showWhen?: { key: string; equals: string };
}

export interface WorkflowNodeSpec {
  /** Node type id — must match core-engine's services/workflow-engine/constant. */
  type: string;
  label: string;
  kind: WorkflowNodeKind;
  /** Has YES/NO outputs instead of a single one. */
  branching?: boolean;
  /**
   * Offered to match the product design, but workflow-engine can't run it yet:
   * it can be saved and test-run (skipped), publishing rejects it.
   */
  preview?: boolean;
  fields: WorkflowField[];
  defaults: Record<string, string>;
  help?: string;
  /** Template variables the editor offers as click-to-insert chips, and the field they insert into. */
  variables?: { field: string; names: string[] };
}

const conditionFields: WorkflowField[] = [
  {
    key: 'field',
    label: 'What to check',
    options: [
      { value: 'message.body', label: 'Message text' },
      { value: 'message.from', label: 'Sender' },
      { value: 'message.channel', label: 'Channel' },
      { value: 'contact.name', label: 'Contact name' },
      { value: 'contact.email', label: 'Contact email' },
      { value: 'contact.phone', label: 'Contact phone' },
    ],
  },
  {
    key: 'operator',
    label: 'How to compare',
    options: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
    ],
  },
  { key: 'value', label: 'Compare with', placeholder: 'YES' },
];

const messageVariables = { field: 'message', names: ['contact.name', 'contact.email', 'contact.phone', 'message.body', 'message.from', 'contact.verify_code', 'contact.claim_address'] };

const textMessageFields: WorkflowField[] = [
  { key: 'to', label: 'Send to', placeholder: '{{message.from}}' },
  { key: 'message', label: 'What reply do you want to send?', placeholder: 'Hi {{message.from}}, thanks for reaching out', multiline: true },
];

const httpFields: WorkflowField[] = [
  { key: 'url', label: 'URL', placeholder: 'https://' },
  {
    key: 'method',
    label: 'Method',
    options: ['GET', 'POST', 'PUT'].map((m) => ({ value: m, label: m })),
  },
];

const fieldValueFields: WorkflowField[] = [
  { key: 'field', label: 'Field' },
  { key: 'value', label: 'Value' },
];

const verifyFields: WorkflowField[] = [
  { key: 'field', label: 'Field to verify' },
  { key: 'check', label: 'Check' },
];

/** A trigger with no settings. Without `help` it is a preview (not runnable yet). */
const simpleTrigger = (type: string, label: string, help?: string): WorkflowNodeSpec => ({
  type,
  label,
  kind: 'trigger',
  preview: !help,
  fields: [],
  defaults: {},
  help,
});

const specs: WorkflowNodeSpec[] = [
  {
    type: 'incoming_message',
    label: 'Incoming Message',
    kind: 'trigger',
    fields: [
      {
        key: 'channel',
        label: 'Channel',
        options: [
          { value: '', label: 'Any channel' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'sms', label: 'SMS' },
          { value: 'email', label: 'Email' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'slack', label: 'Slack' },
        ],
      },
      {
        key: 'slack_listen',
        label: 'Listen to',
        showWhen: { key: 'channel', equals: 'slack' },
        options: [
          { value: 'mentions', label: '@mentions and DMs' },
          { value: 'messages', label: 'Every message' },
          { value: 'both', label: 'Both' },
        ],
      },
      {
        key: 'slack_channel',
        label: 'Slack channel',
        placeholder: '#support-intake (empty = any channel the bot is in)',
        showWhen: { key: 'channel', equals: 'slack' },
      },
    ],
    defaults: {},
    help: 'Starts a run each time someone messages you — a customer on WhatsApp, Instagram or chat, or a teammate on Slack.',
  },
  simpleTrigger('webhook_trigger', 'Webhook'),
  simpleTrigger('contact_created', 'Contact Created', 'Starts when someone reaches you for the first time on any channel. {{contact.*}} has what they gave; use Send WhatsApp to reach them — there is no message to Reply to.'),
  simpleTrigger('campaign_started', 'Campaign Started'),
  simpleTrigger('payment_received', 'Payment Received'),
  simpleTrigger('form_submitted', 'Form Submitted', 'Starts when a visitor sends your website\'s contact form. {{message.body}} is their message, {{contact.name}}/{{contact.email}}/{{contact.phone}} what they typed; use Send WhatsApp to reach them.'),
  simpleTrigger('chatbot_message', 'Chatbot Message', 'Starts on every message in your website chat. Reply answers in the chat.'),

  {
    type: 'reply',
    label: 'Reply',
    kind: 'action',
    fields: [{ key: 'message', label: 'What reply do you want to send?', placeholder: 'Hi {{message.from}}, thanks for reaching out', multiline: true }],
    defaults: { message: '' },
    help: 'Answers on the same channel the message came in on — WhatsApp, Instagram, SMS… whichever the workflow is linked to.',
  },
  { type: 'send_sms', label: 'Send SMS', kind: 'action', preview: true, fields: textMessageFields, defaults: { to: '{{message.from}}', message: '' } },
  {
    type: 'send_whatsapp',
    label: 'Send WhatsApp',
    kind: 'action',
    fields: textMessageFields,
    variables: messageVariables,
    defaults: { to: '{{message.from}}', message: '' },
    help: 'A free-text WhatsApp message reaches the contact only within 24 hours of their last message.',
  },
  {
    type: 'send_email',
    label: 'Send Email',
    kind: 'action',
    preview: true,
    fields: [
      { key: 'to', label: 'To', placeholder: '{{contact.email}}' },
      { key: 'subject', label: 'Subject' },
      { key: 'template', label: 'Template' },
    ],
    defaults: { to: '', subject: '', template: '' },
  },
  {
    type: 'send_slack',
    label: 'Send Slack',
    kind: 'action',
    fields: [
      { key: 'channel', label: 'Channel', placeholder: '#sales' },
      { key: 'message', label: 'Message' },
    ],
    variables: messageVariables,
    defaults: { channel: '#sales', message: '' },
  },
  { type: 'send_instagram', label: 'Send Instagram', kind: 'action', preview: true, fields: textMessageFields, defaults: { to: '{{message.from}}', message: '' } },
  {
    type: 'ask_ai_agent',
    label: 'Ask AI',
    kind: 'action',
    fields: [
      {
        key: 'instructions',
        label: 'Anything extra for this step? (optional)',
        placeholder: 'Offer a demo if they seem interested',
        multiline: true,
      },
    ],
    defaults: { instructions: '' },
    help: 'The AI assistant answers with your knowledge and persona (Settings → AI assistant) and replies on the channel the customer used. If it can\'t answer it sends your handoff message.',
  },
  { type: 'webhook_action', label: 'Webhook', kind: 'action', preview: true, fields: httpFields, defaults: { url: '', method: 'POST' } },
  {
    type: 'update_contact',
    label: 'Update Contact',
    kind: 'action',
    fields: [
      { key: 'field', label: 'Field', placeholder: 'name, city, status…' },
      { key: 'value', label: 'Value', placeholder: 'hot-lead or {{message.body}}' },
    ],
    defaults: { field: 'status', value: '' },
    variables: { field: 'value', names: ['message.body', 'message.from', 'contact.email', 'contact.phone'] },
    help: 'Writes one field on the sender\'s contact. "name" sets their name; anything else is a custom attribute.',
  },
  { type: 'add_tag', label: 'Add Tag', kind: 'action', preview: true, fields: [{ key: 'tag', label: 'Tag', placeholder: 'hot-lead' }], defaults: { tag: '' } },
  { type: 'remove_tag', label: 'Remove Tag', kind: 'action', preview: true, fields: [{ key: 'tag', label: 'Tag', placeholder: 'hot-lead' }], defaults: { tag: '' } },

  { type: 'condition', label: 'Condition', kind: 'logic', branching: true, fields: conditionFields, defaults: { field: 'message.body', operator: 'contains', value: '' } },
  { type: 'branch', label: 'Branch', kind: 'logic', branching: true, fields: conditionFields, defaults: { field: 'message.body', operator: 'contains', value: '' } },
  {
    type: 'ai_intent',
    label: 'AI Intent',
    kind: 'logic',
    branching: true,
    fields: [
      { key: 'question', label: 'Yes/no question about the message', placeholder: 'Is the customer asking about pricing?' },
      { key: 'confidence', label: 'Min. confidence for YES', placeholder: '0.6' },
    ],
    defaults: { question: '', confidence: '0.6' },
    help: 'The AI reads the message and answers the question; YES branch when confident, NO otherwise.',
  },
  {
    type: 'capture_contact',
    label: 'Capture Contact',
    kind: 'logic',
    branching: true,
    fields: [
      {
        key: 'kind',
        label: 'Look for',
        options: [
          { value: 'any', label: 'Email, phone or @handle' },
          { value: 'email', label: 'Email only' },
          { value: 'phone', label: 'Phone only' },
          { value: 'handle', label: 'Instagram @handle only' },
        ],
      },
    ],
    defaults: { kind: 'any' },
    help: 'Finds an email or phone in the message and saves it on the contact — joining the WhatsApp, Instagram and website identities of the same person. YES when found. If the number already belongs to a verified contact, it is not linked until the person sends a code from it: reply with "Send {{contact.verify_code}} from {{contact.claim_address}} to link".',
  },
  {
    type: 'verify_email',
    label: 'Verify Email',
    kind: 'logic',
    branching: true,
    preview: true,
    fields: verifyFields,
    defaults: { field: '{{contact.email}}', check: 'Valid format & deliverable' },
    help: 'YES continues to the next step. NO routes to the branch you connect for an invalid or undeliverable address.',
  },
  {
    type: 'verify_whatsapp_number',
    label: 'Verify WhatsApp Number',
    kind: 'logic',
    branching: true,
    preview: true,
    fields: verifyFields,
    defaults: { field: '{{contact.phone}}', check: 'Number is registered on WhatsApp' },
    help: 'YES continues to Send WhatsApp. NO routes to the branch you connect — e.g. fall back to SMS.',
  },
  { type: 'end', label: 'End', kind: 'end', fields: [], defaults: {} },

  {
    type: 'wait',
    label: 'Wait',
    kind: 'timing',
    fields: [{ key: 'duration', label: 'Duration', placeholder: '24 hours' }],
    defaults: { duration: '24 hours' },
    help: 'e.g. "30 minutes", "24 hours" or "2 days".',
  },
  {
    type: 'delay_until',
    label: 'Delay Until',
    kind: 'timing',
    fields: [{ key: 'time', label: 'Time', placeholder: '09:00' }],
    defaults: { time: '09:00' },
    help: 'Waits for the next occurrence of this time — 24-hour clock, UTC.',
  },

  { type: 'http_request', label: 'HTTP Request', kind: 'integration', preview: true, fields: httpFields, defaults: { url: '', method: 'POST' } },
  { type: 'payment_check', label: 'Payment Check', kind: 'integration', branching: true, preview: true, fields: fieldValueFields, defaults: { field: 'payment.status', value: 'received' } },
  { type: 'crm_update', label: 'CRM Update', kind: 'integration', preview: true, fields: fieldValueFields, defaults: { field: '', value: '' } },
];

export const workflowNodeCatalog: Record<string, WorkflowNodeSpec> = Object.fromEntries(specs.map((s) => [s.type, s]));

const groupTitles: [WorkflowNodeKind[], string][] = [
  [['trigger'], 'Triggers'],
  [['action'], 'Actions'],
  [['logic', 'end'], 'Logic'],
  [['timing'], 'Timing'],
  [['integration'], 'Integration'],
];

/** Palette order, same grouping as the product design. */
export const workflowNodeGroups: { title: string; specs: WorkflowNodeSpec[] }[] = groupTitles.map(([kinds, title]) => ({
  title,
  specs: specs.filter((s) => kinds.includes(s.kind)),
}));

/** Channels a workflow can be linked to — must match core-engine's constant.Channels. */
export const workflowChannels = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'slack', label: 'Slack' },
  { id: 'web', label: 'Website chat' },
] as const;
export type WorkflowChannel = (typeof workflowChannels)[number]['id'];
