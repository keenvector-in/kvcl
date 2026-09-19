# Radio

Native radio with a clickable label. Give radios in one group the same `name`
and wrap them in a `<fieldset>` with a `<legend>`.

```tsx
import { Radio } from '@keenvector/kvcl';

<fieldset>
  <legend>Payment</legend>
  <Radio name="pay" value="cod" label="Cash on delivery" defaultChecked />
  <Radio name="pay" value="online" label="Pay online" />
</fieldset>
```
