# PasswordAuth

The email + password forms every KeenPlaza frontend shares. Phone OTP stays the default login
method; these sit behind the second tab of the login screen, on the `/reset` page the emailed
link opens, and in the account screen.

```tsx
import { PasswordLoginForm, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm, SessionsList, LoginDetailsPanel } from '@keenvector/kvcl';

<PasswordLoginForm login={identity.login} onLoggedIn={reload} onForgotPassword={() => setStep('forgot')} />
<ForgotPasswordForm forgotPassword={identity.forgotPassword} onBack={() => setStep('login')} />
<ResetPasswordForm resetPassword={identity.resetPassword} token={token} onDone={() => setStep('login')} />
<ChangePasswordForm changePassword={identity.changePassword} hasPassword={me.has_password} />
<SessionsList
  sessions={identity.sessions}
  revokeSession={identity.revokeSession}
  revokeOtherSessions={identity.revokeOtherSessions}
/>
// or all of the account bits at once:
<LoginDetailsPanel
  me={me}
  setEmail={identity.setEmail}
  changePassword={identity.changePassword}
  sessions={{ sessions: identity.sessions, revokeSession: identity.revokeSession, revokeOtherSessions: identity.revokeOtherSessions }}
/>
```

Each form owns its own fields, pending and error state; the caller passes the matching
`identityApi` function and decides what happens after success. `PasswordLoginForm` stores the
token pair itself (`setTokens`) before calling `onLoggedIn`.

Notes:

- Identity answers one `invalid_credentials` for an unknown email and a wrong password alike,
  and `ForgotPasswordForm` always shows the same "if that email has an account…" message —
  neither form tells a stranger who has an account.
- In local dev (identity without `SMTP_HOST`) the reset response carries `dev_reset_link`, and
  `ForgotPasswordForm` shows it instead of a mail arriving.
- `hasPassword={false}` drops the "current password" field, for an account created by OTP that
  has never had one.
- `SessionsList` shows the account's live sessions, labelled by the `device_info` the client sent
  at login (`deviceInfo()` derives "Chrome on Windows" from the user agent). Ending a session takes
  effect at once: the gateway polls identity's revocation list and stops accepting that session's
  access token, rather than waiting out its 15-minute TTL.
