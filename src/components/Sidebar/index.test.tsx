import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './index';

const groups = [
  { label: 'Sell', items: [{ key: 'orders' as const, label: 'Orders', count: 4 }] },
  { items: [{ key: 'settings' as const, label: 'Settings' }] },
];

describe('Sidebar', () => {
  it('marks the active item and reports selections', () => {
    const onSelect = vi.fn();
    render(<Sidebar brand="Chai & Co" groups={groups} activeKey="orders" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Orders/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onSelect).toHaveBeenCalledWith('settings');
  });

  it('names the navigation and renders the brand head', () => {
    render(
      <Sidebar brand="Chai & Co" subtitle="Admin" mark="C" groups={groups} activeKey="orders" onSelect={() => {}} label="Store" />,
    );
    expect(screen.getByRole('navigation', { name: 'Store' })).toBeInTheDocument();
    expect(screen.getByText('Chai & Co')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
