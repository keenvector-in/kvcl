import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'kvcl/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Get started' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Large: Story = { args: { variant: 'primary', size: 'lg' } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };
