# RedirectButton

Sends the browser fully away from the app to start a provider's own login/signup
(Meta OAuth, Instagram Business Login, Embedded Signup). Not client-side routing —
use `Button as={Link}` for that instead.

```tsx
import { RedirectButton } from '@keenvector/kvcl';

<RedirectButton
  resolveHref={async () => {
    const { redirect_uri } = await fetchWebhookConfig('instagram');
    return `https://www.facebook.com/v21.0/dialog/oauth?client_id=...&redirect_uri=${redirect_uri}`;
  }}
  loadingChildren="Connecting…"
  onError={(err) => toast.error(String(err))}
>
  Connect Instagram
</RedirectButton>
```

## Props

| Prop | Type | Notes |
|---|---|---|
| `resolveHref` | `() => string \| Promise<string>` | Called on click; its result is the navigation target |
| `onError` | `(error: unknown) => void` | Fires if `resolveHref` rejects; button re-enables |
| `loadingChildren` | `ReactNode` | Shown in place of `children` while resolving |
| ...rest | `ButtonProps` (minus `onClick`/`as`) | Forwarded to the underlying `Button` |
