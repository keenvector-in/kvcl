# Toast

One toast queue, two APIs.

```tsx
// Anywhere, no provider needed — mount <Toaster /> once near the app root.
import { Toaster, toast } from '@keenvector/kvcl';

toast('Saved', 'success');
toast('Could not save', { type: 'error', duration: 5000 });

// Or the provider API (mounts its own <Toaster />).
import { ToastProvider, useToast } from '@keenvector/kvcl';

<ToastProvider><App /></ToastProvider>;
const { show } = useToast();
show('Saved', 'success');
```

Mount either `<Toaster />` or `<ToastProvider>` — not both, or every toast renders twice.
