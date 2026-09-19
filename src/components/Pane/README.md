# Pane

Titled content section with an action header. `flush` drops the body padding for tables.

```tsx
<Pane title="Recent orders" actions={<Button size="sm">Export</Button>} flush>
  <DataTable … />
</Pane>
```

Accepts every `HTMLAttributes<HTMLElement>` prop except `title`.
