# Input

Labeled text field with built-in error/hint messaging, wired for accessibility
(`aria-invalid`, `aria-describedby`) out of the box.

```tsx
import { Input } from '@keenvector/kvcl';

<Input label="Business email" placeholder="you@company.com" />
<Input label="Business email" error="Enter a valid email address." />
```
