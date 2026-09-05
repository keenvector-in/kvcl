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
