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

  it('renders a header row with title and actions', () => {
    render(
      <Card title="Payments" actions={<button type="button">Edit</button>}>
        body
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('drops the inner padding with padded={false}', () => {
    render(
      <Card padded={false} className="flush">
        content
      </Card>,
    );
    expect(screen.getByText('content').className).not.toContain('p-6');
  });
});

