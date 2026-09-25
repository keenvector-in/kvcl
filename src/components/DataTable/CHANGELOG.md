# DataTable changelog

## 1.4.1 — 2026-09-22

- Fix: the scroll wrapper is `relative`, so the header's `sr-only` labels stay inside it. Before,
  they escaped and made the whole page scroll sideways on a phone (admin Products, Categories,
  Inventory at 375px).

## 1.4.0 — 2026-09-20

- An `emptyMessage` that is an element renders as the whole empty area instead of being wrapped in EmptyState's title.

## 1.3.0 — 2026-09-20

- A clickable row no longer swallows Enter/Space aimed at a button or link inside it.

## 1.2.0 — 2026-09-20

- Merged with KeenPlaza's data-table: column `label` (alias of `header`), optional `render` (falls back to the row's value), `width` and `align`; `onRowClick`, expandable rows (`expandedRowKey`/`onToggleExpand`/`renderExpanded`), client-side `searchKeys`/`searchPlaceholder`, opt-in `pageSize` paging, `emptyMessage`, `skeleton` shimmer rows and a wrapper `className`. Every existing prop keeps its meaning: with none of the new props the table renders as before (spinner while loading, no paging).

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.

## 1.0.0

- Initial release.
