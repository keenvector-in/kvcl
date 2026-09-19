# Modal

Centered dialog rendered into `document.body`. Render it to open it, stop rendering it to close it.
Escape closes, page scroll locks, focus moves in and returns to the trigger. Full screen on phones
(`sm` stays a centered card).

```tsx
import { Modal } from '@keenvector/kvcl';

{open && (
  <Modal title="Edit product" onClose={() => setOpen(false)} footer={<button onClick={save}>Save</button>}>
    <form>…</form>
  </Modal>
)}
```

Props: `title`, `onClose`, `children`, `footer?`, `size?` (`sm | md | lg`), `width?`, `closeOnBackdrop?`, `className?`.
