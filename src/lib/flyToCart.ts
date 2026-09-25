/**
 * The "it went in the cart" animation: a ghost of the product image arcs into the cart icon.
 * Transform and opacity only, cleans itself up, and does nothing under prefers-reduced-motion —
 * the toast and the count badge still report the result, so nothing depends on this running.
 */
export function flyToCart(from: Element | null, to: Element | null, image?: string) {
  if (!from || !to || typeof document === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const ghost = document.createElement('div');
  const size = Math.min(72, a.width);
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '14px',
    background: image ? `center/cover no-repeat url("${image}")` : 'var(--color-brand-500)',
    boxShadow: '0 12px 30px -10px rgba(20,10,60,.45)',
    zIndex: '2000',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(.7)`, opacity: 0.9, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.18)`, opacity: 0.2 },
    ],
    { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' },
  );
  anim.onfinish = () => ghost.remove();
  anim.oncancel = () => ghost.remove();
}
