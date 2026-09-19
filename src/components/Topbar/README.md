# Topbar

Sticky page header: breadcrumb + title on the left, actions on the right. Pass `onMenu` to show
the drawer button that appears under `lg` (`AppShell`'s console shape does this for you).

```tsx
<Topbar crumb="Catalog / Products" title="Products" onMenu={() => setOpen(true)}
  actions={<IconButton label="Notifications" icon={<Icon name="bell" />} count={3} />} />
```
