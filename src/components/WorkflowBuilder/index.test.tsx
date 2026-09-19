import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { workflowNodeCatalog } from './catalog';
import { WorkflowBuilder, type WorkflowGraph } from './index';
import { NodeConfigPanel } from './NodeConfigPanel';

// jsdom has no layout; React Flow needs these to mount.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  (globalThis as { DOMMatrixReadOnly?: unknown }).DOMMatrixReadOnly ??= class {
    m22 = 1;
  };
});

const graph: WorkflowGraph = {
  nodes: [
    { id: 't', type: 'incoming_message', label: 'Incoming SMS', position: { x: 0, y: 0 }, config: {} },
    { id: 'c', type: 'condition', label: 'Reply contains YES?', position: { x: 0, y: 120 }, config: { field: 'message.body', operator: 'contains', value: 'YES' } },
  ],
  edges: [{ id: 'e1', source: 't', target: 'c', source_handle: '' }],
};

describe('WorkflowBuilder', () => {
  it('adds a step from the palette with its catalog defaults and reports the graph', async () => {
    const onChange = vi.fn();
    render(
      <div style={{ height: 600 }}>
        <WorkflowBuilder defaultValue={graph} onChange={onChange} />
      </div>,
    );

    const palette = screen.getByRole('complementary', { name: 'Steps' });
    await userEvent.click(within(palette).getByRole('button', { name: 'Send WhatsApp' }));

    const reported: WorkflowGraph = onChange.mock.lastCall![0];
    expect(reported.nodes).toHaveLength(3);
    const added = reported.nodes[2];
    expect(added.type).toBe('send_whatsapp');
    expect(added.config).toEqual(workflowNodeCatalog.send_whatsapp.defaults);
    expect(reported.edges).toEqual(graph.edges);
  });

  it('opens the new step in the settings panel and reports config edits', async () => {
    const onChange = vi.fn();
    render(
      <div style={{ height: 600 }}>
        <WorkflowBuilder defaultValue={graph} onChange={onChange} />
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Wait' }));

    const settings = screen.getByRole('complementary', { name: 'Step settings' });
    const duration = within(settings).getByLabelText('Duration');
    await userEvent.clear(duration);
    await userEvent.type(duration, '2 days');

    const reported: WorkflowGraph = onChange.mock.lastCall![0];
    expect(reported.nodes.find((n) => n.type === 'wait')?.config.duration).toBe('2 days');
  });

  it('marks steps the engine cannot run yet', () => {
    render(<WorkflowBuilder defaultValue={graph} />);
    expect(screen.getByRole('button', { name: /^Send Email\s*Soon$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send WhatsApp' })).toBeInTheDocument();
  });

  it('hides the palette when read-only', () => {
    render(<WorkflowBuilder defaultValue={graph} readOnly />);
    expect(screen.queryByRole('complementary', { name: 'Steps' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });
});

describe('NodeConfigPanel', () => {
  it('renders the condition fields and patches only the changed key', async () => {
    const onChange = vi.fn();
    render(<NodeConfigPanel node={graph.nodes[1]} onChange={onChange} onDelete={() => {}} />);

    await userEvent.selectOptions(screen.getByLabelText('How to compare'), 'equals');

    expect(onChange).toHaveBeenCalledWith({ config: { field: 'message.body', operator: 'equals', value: 'YES' } });
  });

  it('disables every field when read-only', () => {
    render(<NodeConfigPanel node={graph.nodes[1]} onChange={() => {}} onDelete={() => {}} readOnly />);
    expect(screen.getByLabelText('Compare with')).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Delete step/ })).not.toBeInTheDocument();
  });
});
