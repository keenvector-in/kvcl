# kvcl — the shared component library

Shared, typed React + Tailwind components for **both products**: KeenVector's consoles and
marketing site, and KeenPlaza's commerce portals (business admin, super admin, storefront,
marketing). One package, one `src/`, one build — a component exists once and both products
import it from `@keenvector/kvcl`. Modeled on the same idea as
LendFoundry's KCL (per-component folder: implementation, stories, tests, README) but
deliberately **not** copying its server-driven/JSON-config rendering architecture — that
pattern (backend-served component trees, string-keyed action resolution) is exactly what
KeenVector's own gatekeeper rules block (no executable code in tenant config, no untyped
interface at a boundary). kvcl components take plain, typed props — nothing more.

## Structure

```
src/components/<Name>/
  index.tsx          component implementation
  index.stories.tsx   Storybook stories
  index.test.tsx      Vitest + Testing Library tests
  README.md            usage docs
```

## Commands

```bash
npm install
npm run dev              # Vite dev server (empty shell — use Storybook to browse components)
npm run storybook        # browse every component at localhost:6006
npm run test              # unit tests (Vitest + jsdom + Testing Library)
npm run test:storybook    # story-based interaction tests (Playwright-driven, via Storybook's vitest addon)
npm run build              # library build -> dist/kvcl.es.js, dist/index.d.ts, dist/kvcl.css
```

## Theming

Tokens live in `src/theme.css`, exported as `@keenvector/kvcl/theme.css`. Import it in an
app's own Tailwind entry (after `@import "tailwindcss"`) instead of copying tokens.
Components use semantic tokens (`fg`, `fg-muted`, `surface`, `line`, `page`), dark by
default; put `data-kv-mode="light"` on any ancestor for light surfaces. `ThemeProvider`
re-skins a subtree from a tenant's `#rrggbb` brand/accent colours and a closed font set.

## Component versions

Every component folder has `version.ts` and `CHANGELOG.md`. Bump both with any
user-visible change; `componentVersions` exports the map, and `src/versions.test.tsx`
fails if a component is missing or its changelog disagrees.

## Using it from another app

```bash
npm install @keenvector/kvcl
```

```tsx
import { Button, Card, Badge, Input, Container } from "@keenvector/kvcl";
import "@keenvector/kvcl/styles.css";
```

The stylesheet carries the shared design tokens (`--color-brand-*`, `--color-ink-*`,
`--color-accent-*`, fonts) as Tailwind v4 `@theme` values — components reference these
tokens by class name (`bg-brand-500`, `text-ink-200`, …), so importing the stylesheet once
is what makes every component look right.

## Two brands, one token set

Every component reads semantic tokens, never a product's colours. `<html>` carries the brand:

```html
<html data-kv-brand="keenplaza" data-kv-mode="dark">
```

`data-kv-brand="keenplaza"` swaps `--kv-brand/accent/warm/gradient-*` and the surface palette to
the KeenPlaza prototype's values; leaving it off gives KeenVector's. `data-kv-mode` is `light` or
`dark` — `applyStoredColorMode()` sets it from the saved choice, which follows the OS by default,
and `ColorModeToggle` changes it. A single storefront can be re-skinned per tenant with
`themeVariables(storeTheme)`, which returns the same `--kv-*` variables as a style object.

Two Tailwind v4 details worth knowing: `--font-display` falls back to `--kv-font` (Inter), so an app
that wants a display face must set `--kv-font-display` itself; and `@theme inline` values are inlined
into utilities rather than published as custom properties, so hand-written CSS gets them from the
alias layer at the end of `theme.css` — add the `kv-scope` class to any element that sets its own
`--kv-*` (a storefront root, a tenant preview) and `var(--color-surface)` and friends resolve there.

Beyond the KeenVector set (`fg`, `fg-muted`, `fg-subtle`, `surface`, `line`, `page`, `brand-*`,
`accent-*`) the tokens now include `surface-2`, `sunken`, `line-strong`, `on-brand`, the status
colours `success | warning | danger | info` each with a `-soft` tint, `warm-500`, and
`rail`/`rail-fg`/`rail-line` for the console's dark sidebar.

## Components

Layout and shell: `AppShell` (console shape or sidebar/topbar layout), `Sidebar`, `Topbar`,
`PageShell`, `Pane`, `Container`, `PageHeader`, `AuthLayout`, `ErrorBoundary`.
Actions and inputs: `Button`, `IconButton`, `RedirectButton`, `Input`, `TextField`, `TextArea`,
`Select`, `Checkbox`, `Radio`, `Switch`, `SearchBox`.
Feedback and overlay: `Modal`, `Drawer`, `ConfirmDialog`, `Toast` (`ToastProvider`/`useToast` and
`toast()`/`<Toaster />`), `InlineStatus`, `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`,
`Reveal`, the `useOverlay` hook.
Data: `DataTable`, `Tabs`, `Badge`, `StatusPill`, `StatCard`, `Card`, `TenantIdDisplay`.
Commerce: `PriceTag`, `StockBadge`, `ProductCard`, `formatMinor`.
Brand: `Icon` (the prototype's named set, drawn with lucide), `LogoMark`, `ColorModeToggle`,
`ThemeProvider`. Automation: `WorkflowBuilder`, `NodeConfigPanel`.

Also shipped: KeenPlaza's gateway clients (`createHttpClient` + `identityApi`, `tenantApi`,
`catalogApi`, `pricingApi`, `inventoryApi`, `cartApi`, `searchApi`, `customerApi`, `orderApi`,
`logisticsApi`, `platformApi`, `paymentApi`, `leadsApi`, `storefrontApi`) and KeenVector's
`apiClient`; both raise the same `ApiError`.

kvcl re-exports `lucide-react`. Four icons whose names a component or type already uses are
re-exported with a suffix instead: `RadioIcon`, `SidebarIcon`, `StoreIcon`, `WarehouseIcon`.

## Adding a component

Copy the shape of an existing one (`Button/` is the most complete example): implementation
+ stories + tests + README + `version.ts` + `CHANGELOG.md`, add it to `src/versions.ts`
(`versions.test.tsx` enforces this) and export it from `src/index.ts`.
