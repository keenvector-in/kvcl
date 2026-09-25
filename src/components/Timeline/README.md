# Timeline

What happened to an order, a shipment or a record, oldest first.

```tsx
<Timeline
  currentIndex={history.length - 1}
  entries={history.map((h) => ({ id: h.id, title: STATUS_LABEL[h.status], time: fmt(h.at), meta: h.note }))}
/>
```

Steps that haven't happened get `tone="muted"`. Times are passed already formatted — the component
never picks a locale for you. `animate` fades the rows in on mount and is dropped under reduced motion.
