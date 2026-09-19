# AppShell

The authenticated shell every console screen renders inside: sidebar + sticky topbar + content.
Under `lg` the sidebar becomes a drawer closed by Escape or a backdrop click.

Two call shapes.

Layout — you compose the parts (KeenPlaza portals):

```tsx
const [open, setOpen] = useState(false);

<AppShell
  sidebarOpen={open}
  onSidebarClose={() => setOpen(false)}
  sidebar={<Sidebar brand="Chai & Co" groups={groups} activeKey={page} onSelect={setPage} />}
  topbar={<Topbar title="Orders" onMenu={() => setOpen(true)} />}
>
  <OrdersScreen />
</AppShell>
```

Console — hand it routes, it builds `Sidebar` + `Topbar` (needs a react-router context):

```tsx
<AppShell brand="KeenVector" nav={nav} userLabel={user.email} onLogout={logout}>
  <Outlet />
</AppShell>
```
