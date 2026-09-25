# Chip

A filter, facet or category as a pill.

```tsx
<Chip selected={cat === c.id} count={c.count} onClick={() => setCat(c.id)}>{c.name}</Chip>
<Chip onRemove={() => clear('brand')}>Brand: Acme</Chip>
```

Toggle chips report `aria-pressed`; a chip with `onRemove` is a plain button with an × inside.
Put a row of them in a `ScrollRail` so they scroll instead of wrapping on a phone.
