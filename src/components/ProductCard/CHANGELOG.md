# ProductCard changelog


## 1.2.0 — 2026-09-25

- `imageAlt` and `imageSrcSet`: a real product photo needs alt text and renditions. The placeholder art
  keeps an empty alt, because it says nothing the title doesn't.

## 1.1.2 — 2026-09-22

- The title reserves two lines, so cards in a grid row keep the same height whether a title wraps or not.

## 1.1.1 — 2026-09-22

- The eyebrow (brand) is muted uppercase text, as in the prototype `.p-brand`, instead of brand colour, so
  it no longer competes with the price.

## 1.1.0 — 2026-09-20

- Storefront slots: `action` (quick-add, revealed on hover/focus and always visible on touch), `overlay` (out of stock), `ribbon` (live offer), and `as`/`linkProps` for a router link.
- Hover lift and a slow image zoom, both dropped under reduced motion.

## 1.0.0 — 2026-09-20

- Ported from the KeenPlaza library (`product-card`); same props, Tailwind on kvcl tokens.
