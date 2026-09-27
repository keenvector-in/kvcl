import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { duration } from '../../lib/motion';

export interface CrossfadeProps {
  /** Changes when the content changes — an image id, a tab name. */
  contentKey: string;
  children: ReactNode;
  /** Height is usually fixed by the caller; the leaving copy is absolutely positioned over it. */
  className?: string;
}

/**
 * Swaps one piece of content for another by fading, instead of replacing it in a single frame.
 *
 * A hard swap reads as a glitch: the eye cannot tell whether the new thing is the result of the click
 * or a page error. 180ms is enough to connect the two without making someone wait to see what they
 * asked for.
 *
 * The container must establish a size (an aspect ratio, or a height) — the outgoing copy is taken out
 * of flow so the two never push each other around.
 */
export function Crossfade({ contentKey, children, className }: CrossfadeProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, position: 'absolute', inset: 0 }}
          transition={{ duration: reduce ? 0 : duration.instant + 0.06, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
