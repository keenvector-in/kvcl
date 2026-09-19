import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './index';



const meta: Meta<typeof PageHeader> = {
  title: 'kvcl/PageHeader',
  component: PageHeader,
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const WithActions: Story = {
  args: { title: 'Workflows', description: 'Automated journeys across every channel.', actions: <button type="button">Create</button> },
};
