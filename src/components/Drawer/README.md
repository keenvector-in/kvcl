# Drawer

Full-height sheet sliding in from a screen edge: mobile menus, filters, detail panes. Same Escape,
scroll-lock and focus behaviour as Modal.

```tsx
import { Drawer } from '@keenvector/kvcl';

{open && (
  <Drawer title="Filters" side="left" onClose={() => setOpen(false)}>
    <FilterForm />
  </Drawer>
)}
```

Props: `title`, `onClose`, `children`, `footer?`, `side?` (`left | right`), `wide?`, `className?`.
