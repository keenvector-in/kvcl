import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockBadge } from './index';

describe('StockBadge', () => {
  // Class fragments come from Badge's tone table: success / warning / danger / neutral.
  it.each([
    ['in_stock', 'In stock', 'text-success'],
    ['low', 'Low stock', 'text-warning'],
    ['out', 'Out of stock', 'text-danger'],
    ['untracked', 'In stock', 'text-fg-muted'],
  ] as const)('renders %s', (status, label, toneClass) => {
    const { container } = render(<StockBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain(toneClass);
  });

  it('counts down when low stock names the units left', () => {
    render(<StockBadge status="low" available={3} />);
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('keeps the plain label when low stock has no count', () => {
    render(<StockBadge status="low" />);
    expect(screen.getByText('Low stock')).toBeInTheDocument();
  });
});
