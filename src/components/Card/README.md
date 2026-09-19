# Card

Surface container: rounded corners, subtle border, translucent fill. Base building block
for feature cards, dashboard tiles, and list items.

```tsx
import { Card } from '@keenvector/kvcl';

<Card className="w-80">
  <h3>Shared inbox</h3>
  <p>Manage customer conversations from a centralized interface.</p>
</Card>
```

Accepts every `HTMLAttributes<HTMLDivElement>` prop in addition to `className`.

Pass `title` (and optionally `actions`) for a bordered header row, and `padded={false}`
for edge-to-edge content such as a table.

## Overriding styles

`className` is appended, but Tailwind resolves conflicts by stylesheet order, not attribute order:
passing a utility from a group the component already sets (a background, a border colour, padding)
may silently lose. Render your own element, or ask for a prop, instead of fighting it — `StatCard`'s
accent tile does the former.
