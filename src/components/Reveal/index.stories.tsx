import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reveal } from './index';



const meta: Meta<typeof Reveal> = {
  title: 'kvcl/Reveal',
  component: Reveal,
};
export default meta;

type Story = StoryObj<typeof Reveal>;

export const Default: Story = { args: { children: <div className="rounded-xl bg-brand-500 p-6 text-white">Scroll-revealed</div> } };
