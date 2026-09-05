import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './index';

const meta: Meta<typeof Input> = {
  title: 'kvcl/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: { label: 'Business email', placeholder: 'you@company.com' },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "We'll send onboarding steps here." } };
export const WithError: Story = { args: { error: 'Enter a valid email address.' } };
