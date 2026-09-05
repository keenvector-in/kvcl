import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './index';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('merges a passed className with its own', () => {
    render(<Card className="w-80">content</Card>);
    expect(screen.getByText('content')).toHaveClass('w-80', 'rounded-2xl');
  });
});
