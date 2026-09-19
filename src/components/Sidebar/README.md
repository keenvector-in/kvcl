# Sidebar

Admin navigation column: brand head, grouped links with optional icons and counts, footer slot.
Place it in `AppShell`'s `sidebar` slot.

```tsx
<Sidebar
  brand="Chai & Co"
  subtitle="Admin console"
  mark={<LogoMark />}
  groups={[{ label: 'Sell', items: [{ key: 'orders', label: 'Orders', count: 4 }] }]}
  activeKey={page}
  onSelect={setPage}
  footer={<TenantIdDisplay tenantId={tenantId} variant="inline" />}
/>
```

`activeKey`/`onSelect` are typed by the item keys (`Sidebar<'orders' | 'products'>`).
