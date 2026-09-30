# PasswordAuth changelog

## 1.3.0 — 2026-09-30

- Identity's error codes read as sentences (`invalid_credentials` → "That email and password don’t match…"); anything unmapped gets a capital letter; a network failure says so. Exported as `authErrorText`.
- `LoginDetailsPanel` leaves out the "Mobile number" line for an account made with e-mail alone, instead of printing a blank.

## 1.2.0 — 2026-09-22

- New `RegisterForm`: email sign-up (email, password, password again) for accounts that don't start
  from a phone number, so nobody depends on WhatsApp OTP to get in. Pairs with `identity.register`.

## 1.1.0 — 2026-09-20

- New `SessionsList`: the account's live sessions with "sign out" per device and "sign out
  everywhere else". `LoginDetailsPanel` shows it when passed a `sessions` prop.

## 1.0.0 — 2026-09-20

- New: `PasswordLoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `ChangePasswordForm` and `LoginDetailsPanel` —
  the email + password half of the login screen, shared by the two consoles and the storefront
  (prototype `#/login`, `#/forgot`, `#/reset`, `#/account`).
