import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './index';

describe('Button', () => {
  it('renders children and responds to click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Get started</Button>);
    const button = screen.getByRole('button', { name: 'Get started' });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a different element via `as`, without dropping props', () => {
    render(
      <Button as="a" href="/signup">
        Sign up
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toHaveAttribute('href', '/signup');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Get started
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button (merged KeenPlaza props)', () => {
  it('is disabled and busy while loading, and does not fire onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Saving
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the icon when not loading and hides it while loading', () => {
    const { rerender } = render(<Button icon={<span data-testid="icon" />}>Add</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    rerender(
      <Button icon={<span data-testid="icon" />} loading>
        Add
      </Button>,
    );
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('stretches with `block` and renders every variant', () => {
    render(
      <Button block variant="danger">
        Cancel
      </Button>,
    );
    expect(screen.getByRole('button').className).toContain('w-full');
  });
});
