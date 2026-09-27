# Accordion

A section that folds away, so a long settings screen reads as a list of headings. Built on native
`<details>`/`<summary>`: keyboard, screen readers and find-in-page work without script, and the body
stays mounted, so typed-in form state survives closing it.

```tsx
<Accordion icon={<Icon name="users" size={16} />} title="About us" description="Shown at /about" meta={<StatusPill label="On" tone="success" />} defaultOpen>
  …fields…
</Accordion>

// nested rows, one open at a time
<Accordion variant="plain" group="questions" title="1. Your name" meta="Required">…</Accordion>
```
