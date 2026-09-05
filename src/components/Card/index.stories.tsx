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
