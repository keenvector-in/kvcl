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
