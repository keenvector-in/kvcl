# Badge changelog

## 1.2.0 — 2026-09-20

- `warning` uses the shared `warning`/`warning-soft` tokens instead of raw amber utilities.
- Merged with KeenPlaza's badge: added the `success`, `danger`, `error`, `info` and `primary` tones (`primary` is an alias of `brand`, `error` of `danger`) and an opt-in leading `dot`. `neutral` stays the default and the existing tones are unchanged.

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.

## 1.0.0

- Initial release.
