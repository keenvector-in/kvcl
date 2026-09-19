# Toast changelog

## 1.2.0 — 2026-09-20

- Merged the KeenPlaza toast system in: `toast()` and `<Toaster />` now ship alongside `ToastProvider`/`useToast`, both feeding one internal store. `ToastProvider` mounts a `<Toaster />` itself, so its API is unchanged.

## 1.1.0 — 2026-09-15

- Styled with semantic tokens (`fg`, `surface`, `line`) so it renders on light pages (`data-kv-mode="light"`) and follows a tenant `ThemeProvider`.

## 1.0.0

- Initial release.
