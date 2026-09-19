import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './index';

const meta: Meta<typeof Badge> = {
  title: 'kvcl/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  args: { children: 'Coming soon' },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Brand: Story = { args: { tone: 'brand', children: 'New' } };
export const Accent: Story = { args: { tone: 'accent', children: 'Connected' } };
export const Warning: Story = { args: { tone: 'warning', children: 'Configuration required' } };
export const Success: Story = { args: { tone: 'success', children: 'Delivered' } };
export const Danger: Story = { args: { tone: 'danger', children: 'Payment failed' } };
export const Info: Story = { args: { tone: 'info', children: 'In transit' } };
export const Primary: Story = { args: { tone: 'primary', children: 'Featured' } };
export const WithDot: Story = { args: { tone: 'success', dot: true, children: 'Live' } };
