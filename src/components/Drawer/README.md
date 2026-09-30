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

## As a phone nav menu

```tsx
<button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="lg:hidden">…</button>
{open && (
  <Drawer title="Menu" side="left" onClose={() => setOpen(false)} className="w-72!">
    <nav aria-label="Main">{/* links: onClick={() => setOpen(false)} so navigating closes it */}</nav>
  </Drawer>
)}
```

It is a labelled `role="dialog"` with `aria-modal`, moves focus to the first link, keeps Tab inside,
closes on Escape/backdrop/close button and returns focus to the menu button. `w-72!` (Tailwind
important) narrows it from the default 520px.
