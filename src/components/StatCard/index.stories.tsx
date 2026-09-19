import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './index';
import { Users } from 'lucide-react';


const meta: Meta<typeof StatCard> = {
  title: 'kvcl/StatCard',
  component: StatCard,
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = { args: { label: 'Active businesses', value: '128', hint: '+12 this month', icon: <Users /> } };
