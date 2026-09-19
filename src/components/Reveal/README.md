# Reveal

Fade + lift children in once, when scrolled into view. Built on `motion`
(peer dependency). Only transform/opacity animate; reduced motion keeps
the fade and drops the movement.

```tsx
{items.map((item, i) => (
  <Reveal key={item.id} delay={i * 0.08}>
    <Card>…</Card>
  </Reveal>
))}
```

| Prop | Type | Default |
|---|---|---|
| `delay` | `number` (s) | `0` |
| `y` | `number` (px) | `24` |
