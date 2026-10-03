import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { WorkflowBuilder } from './index';
import { workflowNodeCatalog } from './catalog';

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
    expect(added.position).toEqual({ x: 0, y: 390 });
    expect(last.edges.some((e: { source: string; target: string }) => e.source === 'r' && e.target === added.id)).toBe(true);
  });
});

describe('WorkflowBuilder canvas readability', () => {
  it('each step shows what it does without opening it', () => {
    render(
      <WorkflowBuilder
        defaultValue={{
          nodes: [
            { id: 'c', type: 'condition', label: 'Mentions KeenPlaza?', position: { x: 0, y: 0 }, config: { field: 'message.body', operator: 'contains', value: 'plaza' } },
            { id: 's', type: 'send_whatsapp', label: 'Forward', position: { x: 0, y: 200 }, config: { to: '917574031586', message: 'New message' } },
          ],
          edges: [],
        }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Message text · Contains · plaza')).toBeInTheDocument();
    expect(screen.getByText('917574031586 · New message')).toBeInTheDocument();
  });

  it('an empty canvas says where to start, and preview steps sit under "coming soon"', () => {
    render(<WorkflowBuilder defaultValue={{ nodes: [], edges: [] }} onChange={() => {}} />);
    expect(screen.getByText('Start with a trigger')).toBeInTheDocument();
    const soon = screen.getAllByText(/coming soon$/)[0].closest('details')!;
    expect(soon.open).toBe(false);
    expect(soon).toHaveTextContent('Webhook');
  });
});

describe('WorkflowBuilder Slack trigger fields', () => {
  const slackGraph = (channel: string) => ({
    nodes: [{ id: 't', type: 'incoming_message', label: 'Trigger', position: { x: 0, y: 0 }, config: { channel } }],
    edges: [],
  });

  it('shows Slack fields only when channel is slack', async () => {
    const { unmount } = render(<WorkflowBuilder defaultValue={slackGraph('whatsapp')} />);
    fireEvent.click(screen.getByText('Trigger'));
    await screen.findByLabelText('Channel');
    expect(screen.queryByLabelText('Listen to')).toBeNull();
    unmount();
    render(<WorkflowBuilder defaultValue={slackGraph('slack')} />);
    fireEvent.click(screen.getByText('Trigger'));
    expect(await screen.findByLabelText('Listen to')).toBeInTheDocument();
    expect(screen.getByLabelText('Slack channel')).toBeInTheDocument();
  });

  it('writes slack_listen and slack_channel to node config', async () => {
    const onChange = vi.fn();
    render(<WorkflowBuilder defaultValue={slackGraph('slack')} onChange={onChange} />);
    fireEvent.click(screen.getByText('Trigger'));
    await userEvent.selectOptions(await screen.findByLabelText('Listen to'), 'both');
    await userEvent.type(screen.getByLabelText('Slack channel'), '#sales');
    const cfg = onChange.mock.calls.at(-1)?.[0].nodes[0].config;
    expect(cfg.slack_listen).toBe('both');
    expect(cfg.slack_channel).toBe('#sales');
  });
});

describe('WorkflowBuilder Slack catalog', () => {
  it('Send Slack is runnable and Incoming Message mentions Slack teammates', () => {
    expect(workflowNodeCatalog.send_slack.preview).toBeFalsy();
    expect(workflowNodeCatalog.incoming_message.help).toBe(
      'Starts a run each time someone messages you — a customer on WhatsApp, Instagram or chat, or a teammate on Slack.',
    );
  });
});
