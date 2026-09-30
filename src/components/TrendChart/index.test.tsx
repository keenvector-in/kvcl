import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendChart } from './index';

// jsdom has no ResizeObserver; the chart keeps its default width
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const points = [
  { x: '2026-09-01', y: 1000 },
  { x: '2026-09-02', y: 2500 },
  { x: '2026-09-03', y: 0 },
];

describe('TrendChart', () => {
  it('names itself and lists every value in the table view', () => {
    render(<TrendChart label="Revenue per day" points={points} formatValue={(y) => `₹${y}`} />);
    expect(screen.getByRole('img', { name: /Revenue per day/ })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('₹2500', { selector: 'td' })).toBeInTheDocument();
  });

  it('reads points with the arrow keys and hides the tooltip on Escape', () => {
    render(<TrendChart label="Revenue per day" points={points} formatValue={(y) => `₹${y}`} />);
    const chart = screen.getByRole('img');
    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.getByRole('status')).toHaveTextContent('₹1000');
    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.getByRole('status')).toHaveTextContent('₹2500');
    fireEvent.keyDown(chart, { key: 'Escape' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('draws nothing broken with no points', () => {
    render(<TrendChart label="Empty" points={[]} />);
    expect(screen.queryAllByRole('row')).toHaveLength(0);
  });
});
