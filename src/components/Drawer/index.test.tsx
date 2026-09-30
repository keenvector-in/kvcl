import { useState } from 'react';
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

  it('works as a mobile nav: left side, Tab wraps inside, focus returns to the menu button', () => {
    function Shell() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button aria-label="Open menu" onClick={() => setOpen(true)}>☰</button>
          {open && (
            <Drawer title="Menu" side="left" onClose={() => setOpen(false)}>
              <nav aria-label="Main">
                <a href="#a">Dashboard</a>
                <a href="#b">Settings</a>
              </nav>
            </Drawer>
          )}
        </>
      );
    }
    render(<Shell />);
    const trigger = screen.getByLabelText('Open menu');
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.className).toContain('left-0');
    expect(screen.getByText('Dashboard')).toHaveFocus();

    screen.getByText('Settings').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByLabelText('Close')).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    // Close is first in DOM order; Shift+Tab from it wraps to the last link.
    expect(screen.getByText('Settings')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});

