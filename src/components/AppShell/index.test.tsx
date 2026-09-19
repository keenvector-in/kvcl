import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './index';
import { Sidebar } from '../Sidebar/index';
import { Topbar } from '../Topbar/index';

describe('AppShell', () => {
  it('renders the layout shape and closes the drawer from the backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <AppShell
        sidebarOpen
        onSidebarClose={onClose}
        sidebar={<Sidebar brand="Store" groups={[{ items: [{ key: 'a', label: 'Orders' }] }]} activeKey="a" onSelect={() => {}} />}
        topbar={<Topbar title="Orders" onMenu={() => {}} />}
      >
        <p>body</p>
      </AppShell>,
    );

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();

    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the console shape and opens the mobile menu', () => {
    const onLogout = vi.fn();
    const { container } = render(
      <MemoryRouter initialEntries={['/orders']}>
        <AppShell
          brand="KeenVector"
          nav={[
            { to: '/orders', label: 'Orders' },
            { to: '/settings', label: 'Settings' },
          ]}
          userLabel="ada@example.com"
          onLogout={onLogout}
        >
          <p>console body</p>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByText('console body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelector('.fixed.inset-0')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(container.querySelector('.fixed.inset-0')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(onLogout).toHaveBeenCalled();
  });
});
