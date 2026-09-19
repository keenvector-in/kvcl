import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './index';

interface Row {
  id: string;
  name: string;
  plan: string;
}

const rows: Row[] = [
  { id: '1', name: 'Acme', plan: 'Growth' },
  { id: '2', name: 'Bolt', plan: 'Starter' },
];

const columns = [
  { key: 'name', header: 'Tenant', render: (r: Row) => r.name },
  { key: 'plan', header: 'Plan', render: (r: Row) => r.plan },
];

const rowKey = (r: Row) => r.id;

describe('DataTable', () => {
  it('renders headers and rows', () => {
    render(<DataTable columns={columns} rows={rows} rowKey={rowKey} />);
    expect(screen.getByText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('shows the empty state, the error state and the loading spinner', () => {
    const { rerender } = render(<DataTable columns={columns} rows={[]} rowKey={rowKey} emptyTitle="No tenants" />);
    expect(screen.getByText('No tenants')).toBeInTheDocument();
    rerender(<DataTable columns={columns} rows={[]} rowKey={rowKey} error="Boom" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    rerender(<DataTable columns={columns} rows={[]} rowKey={rowKey} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders shimmer rows instead of the spinner with skeleton', () => {
    const { container } = render(<DataTable columns={columns} rows={[]} rowKey={rowKey} loading skeleton />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  });

  it('fires onRowClick on click and on Enter', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} rows={rows} rowKey={rowKey} onRowClick={onRowClick} />);
    const row = screen.getByText('Acme').closest('tr') as HTMLTableRowElement;
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('renders the expanded row for the expanded key', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        expandedRowKey="1"
        onToggleExpand={() => {}}
        renderExpanded={(r) => <span>Details for {r.name}</span>}
      />,
    );
    expect(screen.getByText(/Details for Acme/)).toBeInTheDocument();
  });

  it('falls back to the row value and honours column align', () => {
    const { container } = render(
      <DataTable columns={[{ key: 'name', label: 'Tenant', align: 'right' }]} rows={rows} rowKey={rowKey} />,
    );
    expect(screen.getByText('Bolt')).toBeInTheDocument();
    expect(container.querySelector('th')?.className).toContain('text-right');
  });

  it('filters with searchKeys and pages with pageSize', () => {
    render(<DataTable columns={columns} rows={rows} rowKey={rowKey} searchKeys={['name']} pageSize={1} />);
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bolt' } });
    expect(screen.getByText('Bolt')).toBeInTheDocument();
    expect(screen.queryByText('Acme')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.getByText(/No results for/)).toBeInTheDocument();
  });
});
