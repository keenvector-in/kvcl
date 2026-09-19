import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './index';

describe('Drawer', () => {
  it('is a labelled dialog and closes on Escape, backdrop and the close button', () => {
    const onClose = vi.fn();
    render(
      <Drawer title="Filters" onClose={onClose}>
        <button>Inside</button>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Filters');
    expect(screen.getByText('Inside')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(dialog.previousElementSibling!);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
