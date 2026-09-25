# DescriptionList

Facts about a record, as a real `<dl>`.

```tsx
<DescriptionList items={[{ label: 'Subtotal', value: money(sub) }, { label: 'Total', value: money(total) }]} />
<DescriptionList layout="grid" items={[{ label: 'Address', value: addr, wide: true }]} />
```

`rows` is the summary panel shape (label left, value right); `grid` is two columns of pairs for a
detail card. Values are rendered as given — format money and dates before passing them in.
