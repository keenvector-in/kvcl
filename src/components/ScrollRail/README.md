# ScrollRail

A horizontal, snapping row: category tiles, product cards, filter chips.

```tsx
<ScrollRail title="New this week" action={<Button as={Link} to="/products" variant="link">See all</Button>}>
  {products.map((p) => <ProductCard key={p.id} className="w-[220px]" {...p} />)}
</ScrollRail>
```

Give the children a width (`w-[220px]`, `basis-64`) — the rail does not size them. Arrows appear on
pointer devices only; touch users swipe. Scrolling stays native, so keyboard and screen readers work.
