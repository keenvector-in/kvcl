# kvcl design tokens and component sweep — design

Date: 2026-09-27 · Branch: `feat/design-tokens` · Status: approved in conversation, spec for review

## Goal

Make every kvcl component read one set of design tokens so the eight portals that consume kvcl
(five KeenVector, four KeenPlaza — see `../plaza/docs/01_Platform/architecture/kvcl-merge-plan.md`)
look consistent, pass WCAG AA contrast, show a visible focus ring, and respect reduced motion.
KeenVector follows the sandesha prototype (`/home/saurabh/workspace/Project/sandesha_v1.0`);
KeenPlaza keeps its prototype look through its `data-kv-brand="keenplaza"` preset.

Problems this fixes (from the 2026-09-27 audit):

- `theme.css` has colour tokens only. Components invent radius (`rounded-full` buttons,
  `rounded-xl` inputs, `rounded-lg` selects, `rounded-2xl` cards, `rounded-[9px]`), control height
  (28–52 px), 19 arbitrary text sizes (`text-[13px]` ×12, 9/10/11/12 px, rem values) and three focus
  idioms (`ring-2 ring-brand-400`, `outline-2 outline-brand-400`, `focus:ring-2`).
- Contrast failures: `fg-subtle` is 3.76:1 on KeenVector light and 2.40:1 on KeenPlaza light
  (used in 17 components and as placeholder colour); KeenPlaza light `fg-muted` is 4.43:1 on page;
  white text on success 3.37, warning 2.04, danger 3.91, accent 2.49, warm 2.15, KeenPlaza orange
  2.60, info 3.68.
- Modal, Drawer, Toast and Button animate without a reduced-motion path.
- WorkflowBuilder is light-only (`bg-white`, blue/indigo/amber literals) and breaks on dark pages;
  Input and ErrorState use raw reds instead of `danger`; ThemeProvider's default brand `#6366f1`
  differs from `theme.css`'s `hsl(239 84% 60%)`.

## Non-goals

- No change to portal application code except where a portal passes a class to a kvcl component
  that now conflicts (checked per portal during the sweep).
- No new type-scale tokens: Tailwind's default `text-*` scale is the scale.
- No web-portal submodule bump (the user does it after merge).
- No new visual identity; no change to the brand colours themselves beyond the contrast fixes.

## Token design

All new tokens use names that do not exist in Tailwind's default theme, so adding them never
restyles a portal's own `rounded-lg`, `text-sm` or `h-9`. They live in `@theme inline` reading
`var(--kv-*, <KeenVector default>)`, so `ThemeProvider` and `.kv-scope` subtrees keep working, and
are mirrored in the `:root, .kv-scope` alias block for hand-written CSS.

### Radius — `rounded-control`, `rounded-card`, `rounded-overlay`

| Token | KeenVector (default) | KeenPlaza preset |
|---|---|---|
| `--kv-radius-control` → `--radius-control` | 6px | 9999px (pill) |
| `--kv-radius-card` → `--radius-card` | 12px | 16px |
| `--kv-radius-overlay` → `--radius-overlay` | 12px | 20px |

Badges, pills, avatars and switches keep `rounded-full`. Checkbox keeps a small fixed radius
(`rounded-sm`, 4px) in both brands.

### Control height — `h-control-sm`, `h-control`, `h-control-lg`

| Token | KeenVector | KeenPlaza |
|---|---|---|
| `--kv-control-sm` → `--spacing-control-sm` | 2rem (32px) | 2.25rem (36px) |
| `--kv-control` → `--spacing-control` | 2.25rem (36px) | 2.5rem (40px) |
| `--kv-control-lg` → `--spacing-control-lg` | 2.75rem (44px) | 3rem (48px) |

Used by Button, IconButton, Input, TextField, Select, SearchBox, QuantityStepper and the
WorkflowBuilder toolbar. Being in the `--spacing-*` namespace, they also give `size-control`,
`min-h-control` etc.

### Type

No tokens. Components use Tailwind defaults: body/label `text-sm`, caption/meta `text-xs`, section
titles `text-base`/`text-lg`, page titles `text-2xl`. Arbitrary sizes are removed:
`text-[13px]`, `text-[0.8rem]`, `text-[0.95rem]` → `text-sm`; `text-[9px]`…`text-[12px]` → `text-xs`.
Headings keep `tracking-tight`.

### Motion

- `--ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1)` (sandesha's step/pop curve) → `ease-emphasized`.
- Durations use Tailwind steps only: 150 (hover/colour), 200 (enter/exit), 300 (large surfaces).
- `src/lib/motion.ts` durations and ease become the same values (0.15 / 0.2 / 0.3 s and
  `[0.16, 1, 0.3, 1]`), so Framer and CSS motion match.
- Every transform/opacity animation has a reduced-motion path (`motion-reduce:transition-none`,
  `motion-reduce:transform-none`, or `useReducedMotion`). Spinners are exempt (they convey status).

### Focus — `focus-ring`

```css
@utility focus-ring {
  &:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }
}
```

`--color-ring: var(--kv-ring, <brand-500>)`, with `[data-kv-mode="dark"]` (and the KeenVector
default dark surfaces) using brand-400 so the ring stays ≥3:1 against the page. Every interactive
element in kvcl uses `focus-ring` (and `outline-none` only together with it). Containers that wrap
an input use the same outline via `focus-within:` on the container.

### Colour and contrast

Targets, checked by a unit test that parses `theme.css` and computes WCAG ratios for every
brand × mode (KeenVector dark/light, KeenPlaza dark/light):

- `fg`, `fg-muted`, `fg-subtle` ≥ 4.5:1 on `page`, `surface` and `surface-2`.
- New on-colour tokens `--color-on-success`, `--color-on-warning`, `--color-on-danger`,
  `--color-on-info`, `--color-on-accent`, `--color-on-warm` (plus existing `--color-on-brand`) each
  ≥ 4.5:1 on their fill. Warning, accent (teal) and warm/orange get a dark on-colour
  (`--kv-fg` of dark mode or ink-950); success, danger and info may deepen the fill slightly so
  white passes. Exact values are chosen during implementation to satisfy the test while staying
  visually close to the current hue.
- Status text on `-soft` backgrounds (`text-success` on `bg-success-soft`, etc.) ≥ 4.5:1 in all four
  combinations; where a status colour fails as text, add `--color-<status>-fg` for text use.
- `focus-ring` colour ≥ 3:1 against `page` in all four combinations.

The rail tokens stay dark in both modes; `rail-fg` ≥ 4.5:1 on `rail`.

## Component rules (all 57 components + WorkflowBuilder sub-files)

1. Colours only through semantic tokens: no `bg-white`, `text-white` (use `text-on-brand` /
   `text-on-*`), no Tailwind palette colours (`red-*`, `emerald-*`, `amber-*`, `blue-*`, `indigo-*`,
   `slate-*`, `gray-*`, `zinc-*`), no hex/rgb literals. Allowlist: LogoMark and Loader brand art.
2. No arbitrary sizes: no `text-[…]`, `rounded-[…]`, `h-[…]`/`w-[…]` for controls (layout widths
   like `max-w-[…]` in Modal sizing are allowed).
3. Radius from the three roles or `rounded-full` / `rounded-sm` (checkbox).
4. Controls sized with `h-control*`.
5. `focus-ring` on every focusable element; no bare `focus:ring`.
6. Reduced-motion path on every animation except spinners.
7. Each changed component: `version.ts` minor bump + `CHANGELOG.md` entry
   (`src/versions.test.tsx` enforces agreement).

Specific fixes: WorkflowBuilder (all files) onto semantic tokens so it renders on dark pages;
Input and ErrorState onto `danger` / `danger-soft`; Sidebar onto `rail-fg`, no 9/10 px text or
9 px radius; ThemeProvider default brand = `theme.css` default; Button accent/warm/danger/success
variants use their `on-*` colours; Timeline, Toast glyph and Sidebar badge likewise.

## Enforcement

- `src/theme.contrast.test.ts` — the contrast targets above.
- `src/components/tokens.lint.test.ts` — scans `src/components/**/*.tsx` (excluding stories and
  tests) for the banned patterns in rules 1, 2 and 5, with the LogoMark/Loader allowlist; failure
  lists file:line.
- Storybook a11y addon switched from `test: 'todo'` to `test: 'error'`; stories added for Select,
  TextField, Checkbox, Radio, Switch, Modal, Drawer, Toast and SearchBox so `npm run test:storybook`
  exercises the core controls in both brands and both modes (preview decorator sets
  `data-kv-brand` / `data-kv-mode`).

## Verification

- kvcl: `npm run test`, `npm run test:storybook`, `npm run build`.
- All eight portals build against the branch (`npm run build`; web-portal via `yarn build`, which
  builds its pinned submodule — note it tests the pinned kvcl, not this branch, and say so).
- Screenshots, light and dark, beside the prototypes: business-admin-portal (login, dashboard,
  developer API keys + webhooks, workflows editor, website builder), super-admin-portal (tenants),
  one KeenPlaza portal (a screen using Button, Card, Input, ProductCard). KeenPlaza components
  should look unchanged except contrast.

## Risks

- A portal that relied on a kvcl component's old radius/height inside a tight layout may shift by a
  few pixels (36 vs 42 px controls in KeenVector). Checked in the screenshot pass.
- Two builds emit tokens (kvcl `dist/styles.css` and each portal's `@import theme.css`); both come
  from the same file, so they agree as long as portals rebuild after kvcl.
- Deeper success/danger/info fills change those colours slightly in both products.
