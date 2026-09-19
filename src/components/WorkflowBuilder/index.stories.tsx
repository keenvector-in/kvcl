import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowBuilder, type WorkflowGraph } from './index';

const leadFollowUp: WorkflowGraph = {
  nodes: [
    { id: 'n1', type: 'incoming_message', label: 'Incoming message', position: { x: 250, y: 0 }, config: { channel: 'whatsapp' } },
    { id: 'n2', type: 'condition', label: 'Reply contains YES?', position: { x: 250, y: 130 }, config: { field: 'message.body', operator: 'contains', value: 'YES' } },
    { id: 'n3', type: 'send_whatsapp', label: 'Send quotation', position: { x: 80, y: 280 }, config: { to: '{{message.from}}', message: 'Here is your loan quotation' } },
    { id: 'n4', type: 'wait', label: 'Wait 24 hours', position: { x: 80, y: 410 }, config: { duration: '24 hours' } },
    { id: 'n5', type: 'end', label: 'Done', position: { x: 80, y: 540 }, config: {} },
    { id: 'n6', type: 'end', label: 'Not interested', position: { x: 420, y: 280 }, config: {} },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', source_handle: '' },
    { id: 'e2', source: 'n2', target: 'n3', source_handle: 'yes' },
    { id: 'e3', source: 'n2', target: 'n6', source_handle: 'no' },
    { id: 'e4', source: 'n3', target: 'n4', source_handle: '' },
    { id: 'e5', source: 'n4', target: 'n5', source_handle: '' },
  ],
};

const meta: Meta<typeof WorkflowBuilder> = {
  title: 'kvcl/WorkflowBuilder',
  component: WorkflowBuilder,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', padding: 16, background: '#f8fafc' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    defaultValue: leadFollowUp,
    title: <span className="text-sm font-semibold text-ink-900">Loan Lead Follow-up</span>,
  },
};
export default meta;

type Story = StoryObj<typeof WorkflowBuilder>;

export const Editable: Story = {};
export const ReadOnly: Story = { args: { readOnly: true } };
export const Empty: Story = { args: { defaultValue: { nodes: [], edges: [] } } };
