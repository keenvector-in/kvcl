import type { Meta, StoryObj } from '@storybook/react-vite';
import { RedirectButton } from './index';

const meta: Meta<typeof RedirectButton> = {
  title: 'kvcl/RedirectButton',
  component: RedirectButton,
  parameters: { layout: 'centered' },
  args: { children: 'Connect WhatsApp' },
};
export default meta;

type Story = StoryObj<typeof RedirectButton>;

export const Default: Story = {
  args: {
    resolveHref: () => new Promise((r) => setTimeout(() => r('https://example.com'), 800)),
    loadingChildren: 'Connecting…',
  },
};

export const Fails: Story = {
  args: {
    resolveHref: () => Promise.reject(new Error('denied')),
    onError: (error) => alert(String(error)),
  },
};
