import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './index';

const meta: Meta<typeof Container> = {
  title: 'kvcl/Container',
  component: Container,
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  render: () => (
    <Container className="border border-dashed border-white/20 py-8 text-center text-ink-300">
      Max-width, centered page content
    </Container>
  ),
};
