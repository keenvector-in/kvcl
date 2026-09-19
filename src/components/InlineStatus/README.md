# InlineStatus

One-line loading / empty / error / success message next to the thing it describes. Errors are
announced as alerts, the rest politely.

```tsx
import { InlineStatus } from '@keenvector/kvcl';

{isPending && <InlineStatus kind="loading">Loading orders…</InlineStatus>}
{error && <InlineStatus kind="error">Could not load orders.</InlineStatus>}
```

Props: `kind` (`loading | empty | error | success`), `children`, `className?`.
