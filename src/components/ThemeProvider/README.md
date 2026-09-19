# ThemeProvider

Re-skins a subtree from a tenant's branding: brand/accent colour scales,
CTA gradient, font and light/dark surfaces. Scoped to its own element, so a
tenant preview can live inside the KeenVector console.

```tsx
<ThemeProvider theme={{ brandColor: '#059669', accentColor: '#f59e0b', mode: 'light', font: 'poppins' }}>
  <App />
</ThemeProvider>
```

A theme is declarative data: `#rrggbb` colours (anything else is ignored),
`mode` of `dark | light`, `font` from a closed set (`themeFonts`). No CSS or
class names come from tenant config.

Pages without a provider can opt a region into light surfaces with
`data-kv-mode="light"` on any element.
