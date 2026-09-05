# kvcl — KeenVector Component Library

Shared, typed React + Tailwind components for every KeenVector frontend
(`web-portal` today; `business-admin-portal` and `super-admin-portal` later). Modeled on the same idea as
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

## Components

- **Button** — router-agnostic (`as` prop), 3 variants, 2 sizes
- **Card** — surface container
- **Badge** — status/label pill, 4 tones
- **Input** — labeled text field with error/hint + accessibility wiring
- **Container** — max-width page wrapper

## Adding a component

Copy the shape of an existing one (`Button/` is the most complete example): implementation
+ stories + tests + README, then export it from `src/index.ts`.
