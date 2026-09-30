import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorState } from './index';

describe('ErrorState', () => {
  it('uses the danger tokens, not raw red utilities', () => {
    render(<ErrorState message="Can't reach KeenVector right now." />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-danger-soft');
    expect(screen.getByText('Something went wrong')).toHaveClass('text-danger');
    expect(alert.innerHTML).not.toContain('red-500');
  });
});
