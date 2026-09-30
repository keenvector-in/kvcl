# Tabs changelog

## 1.1.1 — 2026-09-30

- The underline tab bar no longer shows a stray vertical scrollbar (the active underline overflowed the list by 1px).
- With no tab matching `value`, the first enabled tab stays keyboard-reachable; tabs get a visible focus ring.

## 1.1.0 — 2026-09-20

- Merged with KeenPlaza's tabs: `variant="segmented"`, per-item `disabled`, `ReactNode` labels, an optional `label` (accessible name), roving tabindex with arrow/Home/End keys, and items may use `key` instead of `id`. The default underline bar is unchanged.

## 1.0.0 — 2026-09-18

- Initial release: underline tab bar with optional count pills, extracted from the portal's Website and AI assistant pages.
