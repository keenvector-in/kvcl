import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './index';

const meta: Meta<typeof Card> = {
  title: 'kvcl/Card',
  component: Card,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <h3 className="font-display text-lg font-semibold text-white">Shared inbox</h3>
      <p className="mt-2 text-sm text-ink-300">
        Manage customer conversations from a centralized interface.
      </p>
    </Card>
  ),
};

export const Titled: Story = {
  render: () => (
    <Card className="w-96" title="Payments" actions={<button className="text-xs text-brand-500">Edit</button>}>
      <p className="text-sm text-fg-muted">Razorpay connected — live keys.</p>
    </Card>
  ),
};

export const Flush: Story = {
  render: () => (
    <Card className="w-96" padded={false}>
      <div className="border-b border-line px-4 py-3 text-sm text-fg">Edge-to-edge content</div>
      <div className="px-4 py-3 text-sm text-fg-muted">No inner padding.</div>
    </Card>
  ),
};
