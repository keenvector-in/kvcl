import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RatingStars } from './index';

describe('RatingStars', () => {
  it('reads out the average and count', () => {
    render(<RatingStars value={4.3} count={12} />);
    expect(screen.getByRole('img', { name: 'Rated 4.3 out of 5, 12 ratings' })).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('picks with a click and moves with arrow keys', () => {
    const onChange = vi.fn();
    render(<RatingStars value={3} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute('tabindex', '0');
    fireEvent.click(screen.getByRole('radio', { name: '5 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(screen.getByRole('radio', { name: '3 stars' }), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(2);
  });
});
