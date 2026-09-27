import type { ElementType, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { staggerItem, staggerList } from '../../lib/motion';

export interface StaggerProps {
  children: ReactNode;
  /** Element to render — `ul` for a list, `div` for a grid. */
  as?: ElementType;
  /** Seconds between children. Leave it alone unless the list is very short or very long. */
  gap?: number;
  /** Animate on mount (default) or when it scrolls into view. */
  when?: 'mount' | 'inView';
  className?: string;
}

/**
 * A list or grid whose children arrive one after another instead of all at once, which lets the eye
 * follow the order rather than being handed a finished block.
 *
 * Wrap each child in `<Stagger.Item>`. Under prefers-reduced-motion the gap collapses to zero and
 * everything fades in together.
 *
 * Use it for results, cards and rows. Do not use it for anything a person is waiting to click: a
 * sequence that delays the last button by 400ms is decoration charged to the user.
 */
export function Stagger({ children, as = 'div', gap, when = 'mount', className }: StaggerProps) {
  const reduce = useReducedMotion();
  const Tag = motion.create(as as ElementType);
  const animation =
    when === 'inView'
      ? { whileInView: 'shown', viewport: { once: true, margin: '0px 0px -8% 0px' } }
      : { animate: 'shown' };
  return (
    <Tag className={className} variants={staggerList(reduce, gap)} initial="hidden" {...animation}>
      {children}
    </Tag>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

function Item({ children, as = 'div', className }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const Tag = motion.create(as as ElementType);
  return (
    <Tag className={className} variants={staggerItem(reduce)}>
      {children}
    </Tag>
  );
}

Stagger.Item = Item;
