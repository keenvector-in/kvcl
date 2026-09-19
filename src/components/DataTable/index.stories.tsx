import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from './index';

interface Row {
  id: string;
  name: string;
  plan: string;
  spend: number;
}

const rows: Row[] = Array.from({ length: 14 }, (_, i) => ({
  id: `t${i + 1}`,
  name: `Tenant ${i + 1}`,
  plan: i % 3 === 0 ? 'Growth' : 'Starter',
  spend: (i + 1) * 1250,
}));

const columns = [
  { key: 'name', header: 'Tenant', render: (r: Row) => r.name },
  { key: 'plan', header: 'Plan', render: (r: Row) => r.plan },
  { key: 'spend', header: 'Spend', align: 'right' as const, width: '8rem', render: (r: Row) => `₹${r.spend}` },
];

const meta: Meta<typeof DataTable<Row>> = {
  title: 'kvcl/DataTable',
  component: DataTable,
};
export default meta;

type Story = StoryObj<typeof DataTable<Row>>;

export const Default: Story = { args: { columns, rows: rows.slice(0, 4), rowKey: (r: Row) => r.id } };

export const Loading: Story = { args: { columns, rows: [], rowKey: (r: Row) => r.id, loading: true } };

export const SkeletonLoading: Story = {
  args: { columns, rows: [], rowKey: (r: Row) => r.id, loading: true, skeleton: true },
};

export const Errored: Story = {
  args: { columns, rows: [], rowKey: (r: Row) => r.id, error: 'Could not load tenants.', onRetry: () => {} },
};

export const Empty: Story = {
  args: { columns, rows: [], rowKey: (r: Row) => r.id, emptyTitle: 'No tenants found.' },
};

export const SearchAndPaging: Story = {
  args: {
    columns,
    rows,
    rowKey: (r: Row) => r.id,
    searchKeys: ['name', 'plan'],
    searchPlaceholder: 'Search tenants…',
    pageSize: 5,
  },
};

export const ExpandableRows: Story = {
  render: () => {
    const [open, setOpen] = useState<string | null>(null);
    return (
      <DataTable
        columns={columns}
        rows={rows.slice(0, 4)}
        rowKey={(r) => r.id}
        expandedRowKey={open}
        onToggleExpand={(r) => setOpen((k) => (k === r.id ? null : r.id))}
        renderExpanded={(r) => <p className="text-sm text-fg-muted">Details for {r.name}.</p>}
      />
    );
  },
};
