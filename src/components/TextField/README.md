# TextField / TextArea

Labelled single- and multi-line text inputs with hint and error text wired up
(`aria-invalid`, `aria-describedby`, `role="alert"`). `className` and `style`
go to the wrapper; every other attribute goes to the control.

```tsx
import { TextField, TextArea } from '@keenvector/kvcl';

<TextField label="Store name" placeholder="Bansal Traders" hint="Shown to customers." />
<TextField label="GSTIN" error="Enter a valid 15-character GSTIN." />
<TextArea label="Description" rows={4} style={{ marginBottom: 0 }} />
```
