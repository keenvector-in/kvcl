# Select

Labelled native `<select>` — native keeps keyboard, mobile pickers and screen
readers working. Pass `options`, or `<option>` children when you need groups.

```tsx
import { Select } from '@keenvector/kvcl';

<Select
  label="Warehouse"
  placeholder="Choose one"
  options={[{ value: 'blr', label: 'Bengaluru' }, { value: 'del', label: 'Delhi' }]}
  value={warehouse}
  onChange={(e) => setWarehouse(e.target.value)}
/>
```
