import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './index';

describe('EmptyState', () => {
  it('renders the title, description and action', () => {
    render(<EmptyState title="No leads yet" description="They show up here." action={<button type="button">Add</button>} />);
    expect(screen.getByText('No leads yet')).toBeInTheDocument();
    expect(screen.getByText('They show up here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders an icon badge only when an icon is given', () => {
    const { rerender } = render(<EmptyState title="Empty" />);
    expect(screen.queryByText('📦')).not.toBeInTheDocument();
    rerender(<EmptyState icon="📦" title="Empty" />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });
});
