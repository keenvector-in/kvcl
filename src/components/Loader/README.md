# Loader

KeenPlaza's branded waiting state — the Arcade mark with its shop bays lighting one after another.

```tsx
<Loader size={96} message="Lighting up the stores…" />  // full page or payment wait
<Loader size={40} />                                    // inside a card
<Loader size={24} label="Saving" />                     // next to a field
```

Under `prefers-reduced-motion` it holds the still mark with the centre bay lit. For a neutral,
brand-free spinner (KeenVector surfaces, dense tables) use `Spinner`.
