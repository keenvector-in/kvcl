import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './index';
import { Button } from '../Button/index';

const meta: Meta<typeof EmptyState> = {
  title: 'kvcl/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  args: { title: 'No campaigns yet' },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: 'Create one to broadcast a template to a list.' },
};
export const WithIcon: Story = {
  args: { icon: '📦', title: 'No orders yet', description: 'Orders show up here as shoppers check out.' },
};
export const WithAction: Story = {
  args: { icon: '🛒', title: 'Your cart is empty', action: <Button size="sm">Browse products</Button> },
};
