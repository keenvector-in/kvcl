import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './index';

describe('Tabs', () => {
  it('marks the active tab, shows counts and reports clicks', () => {
    const onChange = vi.fn();
    render(<Tabs items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B', count: 3 }]} value="a" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /^B/ })).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(screen.getByRole('tab', { name: /^B/ }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('accepts KeenPlaza `key` items and renders a segmented group', () => {
    const onChange = vi.fn();
    render(
      <Tabs
        variant="segmented"
        label="Mode"
        items={[
          { key: 'test', label: 'Test' },
          { key: 'live', label: 'Live' },
        ]}
        value="test"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('group', { name: 'Mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Live' }));
    expect(onChange).toHaveBeenCalledWith('live');
  });

  it('moves selection with the arrow keys and skips disabled tabs', () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', disabled: true },
          { id: 'c', label: 'C' },
        ]}
        value="a"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('tab', { name: 'B' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('c');
  });
});

