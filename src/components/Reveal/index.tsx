import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface RevealProps {
  children: ReactNode;
  /** Seconds. Stagger siblings with `delay={i * 0.08}`. */
  delay?: number;
  /** Distance travelled upward while fading in, in px. */
  y?: number;
  className?: string;
}

/**
 * Fades and lifts its children in the first time they scroll into view.
 * Only transform/opacity animate (compositor-only, no layout). Under
 * prefers-reduced-motion the movement is dropped but the fade stays, so
 * content still arrives gently instead of popping.
 */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0.2 : 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
