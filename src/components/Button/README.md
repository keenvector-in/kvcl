# Button

Primary interactive control. Router-agnostic: pass `as={Link}` (or any component) to
render as something other than `<button>` — kvcl does not depend on react-router itself.

```tsx
import { Button } from '@keenvector/kvcl';
import { Link } from 'react-router-dom';

<Button variant="primary" size="lg">Get started</Button>
<Button as={Link} to="/signup" variant="secondary">Sign up</Button>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'accent' \| 'danger' \| 'success' \| 'link'` | `'primary'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `link` drops the box padding |
| `block` | `boolean` | `false` | Full container width |
| `loading` | `boolean` | `false` | Spinner + `aria-busy`, clicks blocked |
| `icon` | `ReactNode` | | Before the label; replaced by the spinner while loading |
| `iconEnd` | `ReactNode` | | After the label |
| `as` | `ElementType` | `'button'` | Any component accepting `className` and the rest props |
| ...rest | `ButtonHTMLAttributes` | | Forwarded to the rendered element |
