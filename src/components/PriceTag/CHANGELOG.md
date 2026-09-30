# PriceTag changelog

## 1.1.0 — 2026-09-30

- Price and MRP stay on one line and "% off" always takes its own line, so product cards in a row keep their prices level (it used to wrap on some cards and not others).

## 1.0.0 — 2026-09-20

- Ported from the KeenPlaza library (`price-tag`); same props, Tailwind on kvcl tokens.
  `formatMinor` now lives in `src/lib/money.ts`.
