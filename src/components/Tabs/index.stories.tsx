import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './index';

const meta: Meta<typeof Tabs> = {
  title: 'kvcl/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Underline: Story = {
  render: () => {
    const [tab, setTab] = useState('brand');
    return (
      <Tabs
        className="w-[28rem]"
        items={[
          { id: 'brand', label: 'Brand' },
          { id: 'sections', label: 'Sections' },
          { id: 'leads', label: 'Leads', count: 12 },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
  },
};

export const Segmented: Story = {
  render: () => {
    const [mode, setMode] = useState('test');
    return (
      <Tabs
        variant="segmented"
        label="Mode"
        items={[
          { key: 'test', label: 'Test' },
          { key: 'live', label: 'Live' },
        ]}
        value={mode}
        onChange={setMode}
      />
    );
  },
};

export const WithDisabledTab: Story = {
  render: () => {
    const [tab, setTab] = useState('a');
    return (
      <Tabs
        items={[
          { id: 'a', label: 'Basic info' },
          { id: 'b', label: 'Offers', disabled: true },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
  },
};
