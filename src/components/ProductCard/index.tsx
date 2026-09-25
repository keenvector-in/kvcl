import type { ElementType, ReactNode } from 'react';
import { placeholderImage } from '../../tokens/brand';

export interface ProductCardProps {
  /** Product id; seeds the placeholder art when there is no image. */
  id: string;
  title: string;
  /** Image URL. Default: deterministic placeholder art. */
  image?: string;
  /**
   * What the photo shows, for screen readers and for a failed load. Empty is right for the generated
   * placeholder — it carries no information the title doesn't already give — and wrong for a real
   * photo, so pass the merchant's alt text (or the product title) whenever `image` is a real one.
   */
  imageAlt?: string;
  /** Renditions for `srcset`, so a phone doesn't download the full-size copy. */
  imageSrcSet?: string;
  /** Emoji for the placeholder art. */
  emoji?: string;
  /** Small line above the title, usually the brand. */
  eyebrow?: ReactNode;
  /** Overlay in the image corner, e.g. a discount badge. */
  badge?: ReactNode;
  /** Strip along the bottom of the image, e.g. a live offer. */
  ribbon?: ReactNode;
  /** Covers the image when the product cannot be bought ("Out of stock"). */
  overlay?: ReactNode;
  /** Under the title: price, stock, actions. */
  footer?: ReactNode;
  /**
   * Quick action (usually "Add"). On a pointer device it slides up over the image on hover or
   * keyboard focus; on touch it is always visible, where there is no hover to discover it with.
   */
  action?: ReactNode;
  /** Makes the whole card a link. Use `onClick` instead for client-side routing without a real href. */
  href?: string;
  onClick?: () => void;
  /** Render the title link as a router `Link` (pass the component, then its props via `linkProps`). */
  as?: ElementType;
  linkProps?: Record<string, unknown>;
  className?: string;
}

/** Product tile for grids and rails. The title is the accessible name of the link/button. */
export function ProductCard({
  id,
  title,
  image,
  imageAlt,
  imageSrcSet,
  emoji,
  eyebrow,
  badge,
  ribbon,
  overlay,
  footer,
  action,
  href,
  onClick,
  as,
  linkProps,
  className = '',
}: ProductCardProps) {
  const name = <span className="line-clamp-2 min-h-[2.6em] font-semibold text-fg">{title}</span>;
  const Tag = as as ElementType | undefined;
  return (
    <article
      className={`group/card relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-soft transition duration-200 hover:-translate-y-1 hover:border-brand-400/60 hover:shadow-card motion-reduce:hover:translate-y-0 ${className}`}
    >
      <div className="relative aspect-square overflow-hidden bg-sunken">
        <img
          src={image ?? placeholderImage(id, emoji)}
          srcSet={imageSrcSet}
          sizes={imageSrcSet ? '(max-width: 640px) 45vw, 300px' : undefined}
          alt={imageAlt ?? ''}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
        />
        {badge ? <div className="absolute left-2.5 top-2.5">{badge}</div> : null}
        {ribbon ? <div className="absolute inset-x-0 bottom-0">{ribbon}</div> : null}
        {overlay ? (
          <div className="absolute inset-0 grid place-items-center bg-page/70 text-sm font-bold uppercase tracking-wide text-fg backdrop-blur-[1px]">
            {overlay}
          </div>
        ) : null}
        {action && !overlay ? (
          <div className="absolute inset-x-2.5 bottom-2.5 translate-y-2 opacity-0 transition duration-200 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
            {action}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{eyebrow}</span>
        ) : null}
        {Tag ? (
          <Tag {...linkProps} className="hover:underline">
            {name}
          </Tag>
        ) : href ? (
          <a href={href} onClick={onClick} className="hover:underline">
            {name}
          </a>
        ) : onClick ? (
          <button type="button" onClick={onClick} className="text-left hover:underline">
            {name}
          </button>
        ) : (
          name
        )}
        {footer ? <div className="mt-auto">{footer}</div> : null}
      </div>
    </article>
  );
}
