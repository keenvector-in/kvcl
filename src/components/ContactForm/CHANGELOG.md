# ContactForm changelog

## 1.2.0 — 2026-09-30

- Checks e-mail and phone (an Indian mobile, pasted with or without +91) and numbers before sending, each message under its own question.
- A server error that starts with a question's label ("Phone is not a phone number") shows under that question instead of above the button.

## 1.1.0 — 2026-09-27

- Name and text questions honour `min_length` / `max_length`: the limit shows under the field, typing stops at the maximum, and a too-short answer is flagged before sending.

## 1.0.0 — 2026-09-27

- Initial release: renders a store's own Contact us form from its field definition and returns the answers by field id.
