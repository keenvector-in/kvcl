# TrendChart

One series over time (revenue per day, orders per week). Built to the dataviz rules: a single
series has no legend (the title names it), a crosshair tooltip follows the pointer and the arrow
keys, labels are sparse, and a "Show as table" view carries every value.

```tsx
<TrendChart label="Revenue per day" points={series.map((b) => ({ x: b.start, y: b.revenue_minor }))}
  formatValue={(p) => formatMinor(p)} formatTick={(p) => compactRupees(p)} formatX={shortDate} />
```

Colour: `brand-500` on light, `brand-400` on dark — 500 is under 3:1 against the dark surface.
