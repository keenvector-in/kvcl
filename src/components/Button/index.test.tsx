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
