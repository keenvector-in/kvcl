# Badge changelog

## 1.3.0 — 2026-09-30

- Label never wraps (`whitespace-nowrap`): "not connected" stays on one line; let the neighbouring title shrink instead.
- Light-mode `danger`/`error` tone is darker via the theme token (`#c62a2f`, 4.8:1 on `danger-soft`).
- Tone text uses the new `*-fg` tokens (`text-brand-fg`, `text-accent-fg`, `text-success-fg`, `text-warning-fg`, `text-info-fg`): the tone mixed with the mode's text colour, 5:1 or better on the tint in both modes (success was 3.0:1, accent 2.1:1, warning 1.9:1 in light; brand 2.5:1 in dark).

## 1.2.0 — 2026-09-20

- `warning` uses the shared `warning`/`warning-soft` tokens instead of raw amber utilities.
- Merged with KeenPlaza's badge: added the `success`, `danger`, `error`, `info` and `primary` tones (`primary` is an alias of `brand`, `error` of `danger`) and an opt-in leading `dot`. `neutral` stays the default and the existing tones are unchanged.

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.

## 1.0.0

- Initial release.
