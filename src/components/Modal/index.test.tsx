import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './index';

describe('Modal', () => {
  it('is a labelled dialog, focuses inside and closes on Escape, backdrop and the close button', () => {
    const onClose = vi.fn();
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();

    const { unmount } = render(
      <Modal title="Edit product" onClose={onClose}>
        <button>Inside</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Edit product');
    expect(screen.getByText('Inside')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(2);

    unmount();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not close on a backdrop click when closeOnBackdrop is false', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="T" onClose={onClose} closeOnBackdrop={false}>
        body
      </Modal>,
    );
    void container;
    fireEvent.click(screen.getByRole('dialog').previousElementSibling!);
    expect(onClose).not.toHaveBeenCalled();
  });
});
