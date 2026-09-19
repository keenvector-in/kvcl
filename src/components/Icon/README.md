# Icon

The prototype's icon set by name, so screens name an icon instead of importing a glyph:

```tsx
<Icon name="truck" size={18} />
<Icon name="alert" label="Warning" />
```

Names come from `keenplaza-claude/prototype/js/ui.js`; each maps to the lucide icon with the same
shape. `ICON_NAMES` lists them all. For an icon that isn't in the set, import it from lucide directly
(kvcl re-exports `lucide-react`).
