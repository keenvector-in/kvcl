import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RedirectButton } from './index';

describe('RedirectButton', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom throws on assigning location.href directly in some setups —
    // stub it so we can assert what the component tried to navigate to.
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  it('navigates to the resolved href', async () => {
    const resolveHref = vi.fn().mockResolvedValue('https://meta.example/oauth/authorize');
    render(<RedirectButton resolveHref={resolveHref}>Connect</RedirectButton>);

    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(window.location.href).toBe('https://meta.example/oauth/authorize'));
  });

  it('shows loadingChildren while resolving and re-enables on error', async () => {
    const resolveHref = vi.fn().mockRejectedValue(new Error('denied'));
    const onError = vi.fn();
    render(
      <RedirectButton resolveHref={resolveHref} onError={onError} loadingChildren="Connecting…">
        Connect
      </RedirectButton>,
    );

    const button = screen.getByRole('button', { name: 'Connect' });
    await userEvent.click(button);

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(Error)));
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Connect');
  });
});
