# ConfirmDialog

Small confirmation modal for irreversible or risky actions. Name the action on the confirm button,
not "OK".

```tsx
import { ConfirmDialog } from '@keenvector/kvcl';

{asking && (
  <ConfirmDialog
    title="Delete offer"
    message="This removes the offer from 12 products."
    confirmLabel="Delete offer"
    loading={mutation.isPending}
    onConfirm={() => mutation.mutate()}
    onCancel={() => setAsking(false)}
  />
)}
```

Props: `title`, `message`, `confirmLabel?`, `cancelLabel?`, `tone?` (`danger | primary`), `loading?`, `onConfirm`, `onCancel`.
