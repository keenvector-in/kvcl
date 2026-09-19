# StatCard

One KPI: label, value, optional hint, icon, delta and accent tile.

```tsx
<StatCard label="Active businesses" value="128" hint="+12 this month" icon={<Users />} />
<StatCard label="Revenue" value="₹1,42,900" delta={{ text: '+12.1%', direction: 'up' }} accent />
<StatCard label="Orders" value="—" loading />
```
