import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './index';

describe('ConfirmDialog', () => {
  it('confirms, cancels and closes on Escape', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Delete offer" message="Gone for good." confirmLabel="Delete offer" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete offer');
    fireEvent.click(screen.getByRole('button', { name: 'Delete offer' }));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('disables both buttons and ignores Escape while loading', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog title="T" message="m" loading onConfirm={vi.fn()} onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
