import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { WorkflowBuilder } from './index';

const graph = {
  nodes: [
    { id: 't', type: 'incoming_message', label: 'Trigger', position: { x: 0, y: 0 }, config: { channel: 'whatsapp' } },
    { id: 'r', type: 'send_whatsapp', label: 'Reply as Vector', position: { x: 0, y: 200 }, config: { to: '{{message.from}}', message: 'Thanks for reaching out' } },
  ],
  edges: [{ id: 'e', source: 't', target: 'r', source_handle: '' }],
};

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
  (globalThis as { DOMMatrixReadOnly?: unknown }).DOMMatrixReadOnly ??= class { m22 = 1; };
});

describe('WorkflowBuilder editing', () => {
  it('click node -> textarea shows message -> typing patches graph', async () => {
    const onChange = vi.fn();
    render(<WorkflowBuilder defaultValue={graph} onChange={onChange} />);
    fireEvent.click(screen.getByText('Reply as Vector'));
    const ta = (await screen.findByLabelText('What reply do you want to send?')) as HTMLTextAreaElement;
    expect(ta.value).toBe('Thanks for reaching out');
    await userEvent.clear(ta);
    await userEvent.type(ta, 'New text');
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last.nodes.find((n: { id: string }) => n.id === 'r').config.message).toBe('New text');
    // toolbar present on selected node
    expect(screen.getByLabelText('Delete step', { selector: 'button.flex.h-6' })).toBeInTheDocument();
  });
});
