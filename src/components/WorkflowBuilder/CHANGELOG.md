# WorkflowBuilder changelog

## 1.7.0 — 2026-10-04

- Incoming Message shows Slack settings when the channel is Slack: "Listen to" (@mentions and DMs, every message, both) and "Slack channel". Fields can now declare `showWhen` to appear only for a given value of another field.

## 1.6.0 — 2026-09-30

- Each step on the canvas shows a summary of its settings ("Message text · Contains · plaza", "917574031586 · New message…"), so a workflow reads without opening every step.
- Preview ("Soon") steps are folded under a "+ N coming soon" toggle in each palette group; ready steps come first.
- An empty canvas shows where to start. The minimap appears only past 8 steps and is smaller, so it no longer covers steps on small workflows.
- Multiline fields (Reply, Send WhatsApp message) open at a readable height instead of one squashed line.
- Colours come from the theme tokens (`bg-surface`, `text-fg`, `border-line`, …), so the builder follows dark mode.
- Contact Created, Form Submitted and Chatbot Message triggers are runnable (core-engine now starts them) and each explains what it provides.
- Every step type has its own icon (chat bubble, branch, hourglass, sparkles…) in the palette and on the canvas, from one shared map. Palette items, canvas steps and the settings panel are larger.

## 1.5.0 — 2026-09-28

- Undo now covers edge deletions and node moves (a checkpoint is taken on edge removal and at drag start).
- Deleting a step from its toolbar after other edits no longer undoes back to a stale graph.
- Clicking "+" in the step list with a step selected places the new step below it and connects the two; with nothing selected it no longer lands on top of an existing step.

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
