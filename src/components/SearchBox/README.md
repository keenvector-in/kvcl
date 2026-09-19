# SearchBox

Search input with an optional leading icon. `onChange` is called with the new
string — debounce at the call site if it triggers a request.

```tsx
import { Icon, SearchBox } from '@keenvector/kvcl';

<SearchBox value={q} onChange={setQ} icon={<Icon name="search" />} placeholder="Search products…" />
```
