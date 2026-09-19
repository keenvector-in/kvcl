import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './index';

import { Button } from '../Button/index';
import { Card } from '../Card/index';

const meta: Meta<typeof ThemeProvider> = {
  title: 'kvcl/ThemeProvider',
  component: ThemeProvider,
};
export default meta;

type Story = StoryObj<typeof ThemeProvider>;

const sample = (
  <div className="p-6">
    <Card>
      <p className="font-display text-lg font-semibold">Sharma Bakery</p>
      <p className="mt-1 text-sm text-fg-muted">Fresh every morning.</p>
      <Button className="mt-4">Order on WhatsApp</Button>
    </Card>
  </div>
);

export const EmeraldLight: Story = {
  args: { theme: { brandColor: '#059669', accentColor: '#f59e0b', mode: 'light', font: 'poppins' }, children: sample },
};
export const CrimsonDark: Story = {
  args: { theme: { brandColor: '#dc2626', accentColor: '#fbbf24', mode: 'dark', font: 'playfair' }, children: sample },
};
