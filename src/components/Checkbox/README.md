# Checkbox

Native checkbox with a clickable label. `className` goes to the wrapping
`<label>`; everything else to the input.

```tsx
import { Checkbox } from '@keenvector/kvcl';

<Checkbox label="Track inventory" checked={track} onChange={(e) => setTrack(e.target.checked)} />
```
