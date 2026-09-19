# Button changelog

## 1.3.0 — 2026-09-20

- `warm` variant, for the warm brand colour (KeenPlaza's orange CTA, a store's accent).

## 1.2.0 — 2026-09-20

- Merged with KeenPlaza's button: new `outline`, `accent`, `danger`, `success` and `link` variants, plus `block`, `loading` (spinner + `aria-busy` + click blocked), `icon` and `iconEnd` slots. Existing `primary`/`secondary`/`ghost` render exactly as before.

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.
- New `size="sm"` for dense toolbars and table rows.
- Pressed state scales to 98%.

## 1.0.0

- Initial release.
