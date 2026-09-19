import type { ReactNode } from 'react';
import { placeholderImage } from '../../tokens/brand';

export interface ProductCardProps {
  /** Product id; seeds the placeholder art when there is no image. */
  id: string;
  title: string;
  /** Image URL. Default: deterministic placeholder art. */
  image?: string;
  /** Emoji for the placeholder art. */
  emoji?: string;
  /** Small line above the title, usually the brand. */
  eyebrow?: ReactNode;
  /** Overlay in the image corner, e.g. a discount badge. */
  badge?: ReactNode;
  /** Under the title: price, stock, actions. */
  footer?: ReactNode;
  /** Makes the whole card a link. Use `onClick` instead for client-side routing without a real href. */
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** Product tile for grids and rails. The title is the accessible name of the link/button. */
export function ProductCard({
  id,
  title,
  image,
  emoji,
  eyebrow,
  badge,
  footer,
  href,
  onClick,
  className = '',
}: ProductCardProps) {
  const name = <span className="line-clamp-2 font-semibold text-fg">{title}</span>;
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-soft ${className}`}
    >
      <div className="relative aspect-square overflow-hidden bg-sunken">
        <img
          src={image ?? placeholderImage(id, emoji)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {badge ? <div className="absolute left-2.5 top-2.5">{badge}</div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        {eyebrow ? (
          <span className="text-xs font-bold uppercase tracking-widest text-brand-500">{eyebrow}</span>
        ) : null}
        {href ? (
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
