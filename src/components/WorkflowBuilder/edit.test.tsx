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

describe('WorkflowBuilder undo', () => {
  it('undoing a step deletion brings back the step and its edges', async () => {
    const onChange = vi.fn();
    render(<WorkflowBuilder defaultValue={graph} onChange={onChange} />);
    // Edit first so the toolbar's memoised delete would checkpoint a stale graph if it captured one.
    fireEvent.click(screen.getByText('Reply as Vector'));
    const ta = (await screen.findByLabelText('What reply do you want to send?')) as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'Thanks for reaching out!' } });
    fireEvent.click(screen.getByLabelText('Delete step', { selector: 'button.flex.h-6' }));
    let last = onChange.mock.calls.at(-1)?.[0];
    expect(last.nodes.map((n: { id: string }) => n.id)).toEqual(['t']);
    expect(last.edges).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    last = onChange.mock.calls.at(-1)?.[0];
    expect(last.nodes.map((n: { id: string }) => n.id)).toEqual(['t', 'r']);
    expect(last.edges).toHaveLength(1);
    expect(last.nodes.find((n: { id: string }) => n.id === 'r').config.message).toBe('Thanks for reaching out!');
  });
});

describe('WorkflowBuilder add', () => {
  it('"+" with a step selected chains the new step below it and connects them', () => {
    const onChange = vi.fn();
    render(<WorkflowBuilder defaultValue={graph} onChange={onChange} />);
    fireEvent.click(screen.getByText('Reply as Vector'));
    fireEvent.click(screen.getByTitle('Add Reply'));
    const last = onChange.mock.calls.at(-1)?.[0];
    const added = last.nodes.find((n: { id: string }) => n.id !== 't' && n.id !== 'r');
    expect(added.position).toEqual({ x: 0, y: 320 });
    expect(last.edges.some((e: { source: string; target: string }) => e.source === 'r' && e.target === added.id)).toBe(true);
  });
});
