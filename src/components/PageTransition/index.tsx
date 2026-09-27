import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { pageTransition } from '../../lib/motion';

export interface PageTransitionProps {
  children: ReactNode;
  /**
   * Changes when the screen changes — a route path, or a view key. The old screen leaves and the new
   * one arrives when this changes, so it must be stable *within* a screen or the page will re-animate
   * on every render.
   */
  routeKey: string;
  className?: string;
}

/**
 * The same short fade-and-lift between screens in every portal, so moving around feels like one
 * product rather than four.
 *
 * Deliberately quick (about 220ms in, 120ms out). A screen change should feel instant; anything slower
 * reads as the app thinking, and a person clicking through five screens pays the cost five times.
 */
export function PageTransition({ children, routeKey, className }: PageTransitionProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={routeKey} className={className} variants={pageTransition(reduce)} initial="hidden" animate="shown" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
