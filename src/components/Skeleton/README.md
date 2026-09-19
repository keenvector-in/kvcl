# Skeleton

Pulsing placeholder in the shape of content that is loading. Hidden from screen readers — announce
the loading state elsewhere (e.g. `aria-busy` on the region, or an `InlineStatus`).

```tsx
import { Skeleton } from '@keenvector/kvcl';

<Skeleton width={180} height={20} />
<Skeleton />
```

Props: `width?`, `height?`, `radius?`, plus every `HTMLAttributes<HTMLDivElement>`.
