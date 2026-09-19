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
export const Outline: Story = { args: { variant: 'outline', children: 'Discard' } };
export const Accent: Story = { args: { variant: 'accent', children: 'Connect' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Cancel order' } };
export const Success: Story = { args: { variant: 'success', children: 'Mark delivered' } };
export const Link: Story = { args: { variant: 'link', children: 'Read the docs' } };
export const Loading: Story = { args: { loading: true, children: 'Saving' } };
export const Block: Story = { args: { block: true, children: 'Continue' } };
export const WithIcon: Story = { args: { icon: <span aria-hidden="true">＋</span>, children: 'Add product' } };
