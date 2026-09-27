import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './index';

const meta: Meta<typeof Accordion> = {
  title: 'kvcl/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Sections: Story = {
  render: () => (
    <div className="grid max-w-xl gap-3">
      <Accordion title="About us" description="Who you are, shown at /about" meta="On" defaultOpen>
        <p className="m-0 text-sm text-fg-muted">Fields go here.</p>
      </Accordion>
      <Accordion title="Contact us" description="How shoppers reach you" meta="Off">
        <p className="m-0 text-sm text-fg-muted">Fields go here.</p>
      </Accordion>
    </div>
  ),
};

export const NestedRows: Story = {
  render: () => (
    <div className="grid max-w-xl gap-2">
      {['Your name', 'E-mail', 'Message'].map((q, i) => (
        <Accordion key={q} variant="plain" group="questions" title={`${i + 1}. ${q}`} meta="Required">
          <p className="m-0 text-sm text-fg-muted">Question settings.</p>
        </Accordion>
      ))}
    </div>
  ),
};
