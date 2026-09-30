# Button changelog

## 1.5.0 — 2026-09-30

- The `warm` variant uses the new `on-warm` token (white or ink by the colour's luminance) instead of always white — white on a yellow store accent was 1.5:1. Store themes also keep `primary` text readable over every stop of the gradient.

## 1.4.0 — 2026-09-30

- `danger` fills with the new `danger-fill` token (`#c62a2f`): white label 5.6:1 in both modes (was 3.9:1 on `#e5484d` in dark mode).

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
