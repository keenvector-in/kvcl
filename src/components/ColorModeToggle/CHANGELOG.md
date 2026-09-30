# ColorModeToggle changelog

## 1.3.0 — 2026-09-30

- The System state names itself: title and accessible name read "Theme: System (follows your device)" alongside its Monitor icon, so a click that lands on the OS's own mode no longer looks like nothing happened.

## 1.2.0 — 2026-09-28

- `applyStoredColorMode(defaultMode)` takes the mode to use until the person picks one (default `system`, as before), and the toggle starts from it.

## 1.1.0 — 2026-09-20

- Follows the operating system by default (was light); an explicit choice still wins.

## 1.0.0 — 2026-09-18

- Initial release: `useColorMode`, `applyStoredColorMode`, and a light → dark → system toggle button.
