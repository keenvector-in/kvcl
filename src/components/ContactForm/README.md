# ContactForm

Renders a store's Contact us form from its definition (`StoreFormField[]`, saved in the storefront
content) and hands back `{ [field id]: value }` on submit. The admin's live preview and the store use
this one component, so the preview can never drift from what shoppers see.

```tsx
<ContactForm fields={fields} onSubmit={(answers, honeypot) => send.mutate({ answers, website: honeypot })} submitting={send.isPending} error={err?.message} />
<ContactForm fields={draftFields} preview />   // admin: renders, never submits
```

Short fields sit two to a row from `sm`; long text and choice groups take the full width. The server
re-checks every answer against the definition — the checks here only save the shopper a round trip.
A hidden honeypot input is included; pass its value through untouched.
