# AuthLayout changelog

## 1.2.0 — 2026-09-30

- The page no longer scrolls sideways on a phone: the grid columns have a zero minimum, so one long label can't widen them.
- New `as` prop (`main` by default): pass `div` when the app already renders its own `<main>`, instead of nesting two.

## 1.1.0 — 2026-09-20

- Brand panel fades to the warm brand colour, as the prototype does (it faded to teal).

## 1.0.0 — 2026-09-20

- Ported from the KeenPlaza library (`plaza/packages`), re-styled with Tailwind utilities on kvcl's semantic tokens. Props unchanged.
