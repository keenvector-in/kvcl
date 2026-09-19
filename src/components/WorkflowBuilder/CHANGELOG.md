# WorkflowBuilder changelog

## 1.4.0 — 2026-09-18

- Step editor offers click-to-insert variable chips (`{{contact.name}}`, `{{contact.verify_code}}`, …) on Reply, Send WhatsApp and Update Contact.
- New "Capture Contact" logic node (finds an email, phone or Instagram @handle in the message, YES/NO). "Update Contact" is executable. Conditions and message templates can use `contact.name`, `contact.email`, `contact.phone`, and `contact.verify_code` / `contact.claim_address` when a captured number needs proof.

## 1.3.0 — 2026-09-17

- "Ask AI" and "AI Intent" are executable (backed by ai-agent); their settings are one optional instruction / one yes-no question.

## 1.2.0 — 2026-09-17

- New "Reply" action: answers on the channel the message came from. Exports `workflowChannels` for the channel picker.

## 1.1.0 — 2026-09-17

- Selected node shows an edit (pencil) / delete (trash) toolbar; palette items show a + icon.
- Fix: step settings sidebar was hidden in consuming portals (their own `.hidden` utility overrode `md:block`); now uses `max-md:hidden`.

## 1.0.0 — 2026-09-15

- Initial release.
