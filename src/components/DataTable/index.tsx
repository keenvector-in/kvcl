import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Spinner } from '../Spinner/index';
import { EmptyState } from '../EmptyState/index';
import { ErrorState } from '../ErrorState/index';
import { SearchBox } from '../SearchBox/index';
import { Button } from '../Button/index';

export interface DataTableColumn<T> {
  key: string;
  /** Column heading. `label` is the KeenPlaza spelling of the same thing — pass either. */
  header?: ReactNode;
  label?: ReactNode;
  /** Cell content. Default: the row's value at `key`, as text. */
  render?: (row: T) => ReactNode;
  className?: string;
  /** CSS width for the column, e.g. `"12rem"`. */
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  /** Shimmer rows instead of a spinner while `loading` (reserves space, no layout jump). */
  skeleton?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** KeenPlaza's single-line empty text. Wins over `emptyTitle` when given. */
  emptyMessage?: ReactNode;
  /** Fields matched (substring, case-insensitive) by the search box. Omit to hide search. */
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  /** Rows per page. Omit for no paging. */
  pageSize?: number;
  /** Called when a row is clicked (or Enter/Space on it). */
  onRowClick?: (row: T) => void;
  /** Key of the expanded row; clicking a row calls `onToggleExpand`. */
  expandedRowKey?: string | null;
  onToggleExpand?: (row: T) => void;
  renderExpanded?: (row: T) => ReactNode;
  className?: string;
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  skeleton,
  error,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyMessage,
  searchKeys,
  searchPlaceholder = 'Search…',
  pageSize,
  onRowClick,
  expandedRowKey,
  onToggleExpand,
  renderExpanded,
  className = '',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchKeys || !q) return rows;
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)));
  }, [rows, searchKeys, query]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const current = Math.min(page, pageCount - 1);
  const pageRows = pageSize ? filtered.slice(current * pageSize, current * pageSize + pageSize) : filtered;

  const head = (
    <thead className="border-b border-line bg-fg/[0.02] text-xs uppercase tracking-wide text-fg-subtle">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            scope="col"
            style={col.width ? { width: col.width } : undefined}
            className={`px-4 py-3 font-medium ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
          >
            {col.header ?? col.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  if (loading) {
    if (!skeleton) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      );
    }
    return (
      <div className={`relative overflow-x-auto rounded-2xl border border-line bg-surface ${className}`} aria-busy="true">
        <table className="w-full min-w-full text-left text-sm">
          {head}
          <tbody className="divide-y divide-line">
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <span
                      className="block h-3.5 animate-pulse rounded bg-fg/10"
                      style={{ width: `${55 + ((i * 17 + col.key.length * 7) % 40)}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const search = searchKeys ? (
    <SearchBox
      className="mb-4 max-w-xs"
      value={query}
      onChange={(v) => {
        setQuery(v);
        setPage(0);
      }}
      label={searchPlaceholder}
      placeholder={searchPlaceholder}
    />
  ) : null;

  if (filtered.length === 0) {
    // A caller's own `emptyMessage` element replaces the whole empty area — wrapping it in
    // EmptyState's title would nest its markup inside a <p>.
    const custom = emptyMessage !== undefined && typeof emptyMessage !== 'string';
    const empty =
      custom && !query ? (
        <>{emptyMessage}</>
      ) : (
        <EmptyState
          title={query ? `No results for “${query}”.` : ((emptyMessage as string | undefined) ?? emptyTitle)}
          description={query ? undefined : emptyDescription}
        />
      );
    return search ? (
      <div className={className}>
        {search}
        {empty}
      </div>
    ) : (
      empty
    );
  }

  const rowClick = onToggleExpand ?? onRowClick;

  // relative: the header's sr-only labels are absolutely positioned and would otherwise escape the
  // scroller and widen the whole page on a phone.
  const table = (
    <div className="relative overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-full text-left text-sm">
        {head}
        <tbody className="divide-y divide-line">
          {pageRows.map((row) => {
            const key = rowKey(row);
            const expanded = expandedRowKey === key;
            return (
              <Fragment key={key}>
                <tr
                  className={`hover:bg-fg/[0.03] ${rowClick ? 'cursor-pointer' : ''}`}
                  onClick={rowClick ? () => rowClick(row) : undefined}
                  onKeyDown={
                    rowClick
                      ? (e) => {
                          // A row can hold its own buttons and links; Enter/Space there belongs to
                          // them, not to the row's click.
                          if (e.target !== e.currentTarget) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            rowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={rowClick ? 0 : undefined}
                  aria-expanded={onToggleExpand && renderExpanded ? expanded : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-fg ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
                {expanded && renderExpanded ? (
                  <tr>
                    <td colSpan={columns.length} className="bg-surface-2 px-4 py-3">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const pager =
    pageSize && filtered.length > pageSize ? (
      <nav className="flex items-center justify-between gap-3 px-1 py-3 text-xs text-fg-muted" aria-label="Pagination">
        <span>
          {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" type="button" disabled={current === 0} onClick={() => setPage(current - 1)}>
            ← Prev
          </Button>
          <span aria-live="polite">
            Page {current + 1} of {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Next →
          </Button>
        </div>
      </nav>
    ) : null;

  if (!search && !pager && !className) return table;
  return (
    <div className={className}>
      {search}
      {table}
      {pager}
    </div>
  );
}
