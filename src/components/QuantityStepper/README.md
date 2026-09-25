# QuantityStepper

Quantity for a cart line or a product page.

```tsx
<QuantityStepper value={line.qty} max={stock.available} busy={update.isPending}
  onChange={(qty) => update.mutate(qty)} onRemove={() => remove.mutate()} label={line.title} />
```

At `min` the − button removes the line when `onRemove` is given, otherwise it disables. `max` is the
stock ceiling. The value is announced politely, so a screen reader hears each change.
