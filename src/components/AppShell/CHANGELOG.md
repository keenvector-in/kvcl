# AppShell changelog

## 1.2.0 — 2026-09-20

- Merged with KeenPlaza's layout shell. Two call shapes:
  - layout — `sidebar`, `topbar`, `children`, `sidebarOpen`, `onSidebarClose` (the ported KeenPlaza API):
    you compose `Sidebar` and `Topbar` yourself; under `lg` the sidebar is an off-canvas drawer closed
    by Escape or a backdrop click (`useOverlay`).
  - console — `brand`, `nav`, `userLabel`, `onLogout`, `children` (the original KeenVector API, unchanged):
    the shell builds `Sidebar` + `Topbar` internally, resolves the active item from the router location
    and navigates on select, including the mobile drawer.
- `AppShellNavItem.label` widened from `string` to `ReactNode`.

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.

## 1.0.0

- Initial release.
