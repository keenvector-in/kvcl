# Switch

On/off toggle: a native checkbox with `role="switch"`, so Space toggles it and
`checked` / `onChange` behave as usual. `hideLabel` hides the text visually but
keeps it for screen readers.

```tsx
import { Switch } from '@keenvector/kvcl';

<Switch label="Accept online payments" checked={online} onChange={(e) => setOnline(e.target.checked)} />
```
