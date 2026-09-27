import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { duration as motionDuration } from '../../lib/motion';

export interface CountUpProps {
  /** The real number. Whatever is on screen mid-animation is a tween, never a claim. */
  value: number;
  /** Wraps the final value — currency, units, a percent sign. */
  format?: (n: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
}

/**
 * Counts a figure up when it first comes into view, so a dashboard reads as "these were measured"
 * rather than a wall of static digits.
 *
 * Three deliberate constraints, because animating numbers can lie:
 * - it always lands **exactly** on `value` — no easing residue, no rounding drift;
 * - `prefers-reduced-motion` shows the final number immediately;
 * - a change of `value` after the first run jumps rather than re-counts, so a figure refreshing in the
 *   background never looks like it is climbing again.
 */
export function CountUp({ value, format = (n) => n.toLocaleString('en-IN'), duration = motionDuration.entrance, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const ran = useRef(false);

  useEffect(() => {
    if (reduce || ran.current || !inView) {
      if (reduce || ran.current) setShown(value);
      return;
    }
    ran.current = true;
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // ease-out cubic: quick at first, settling at the end
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(t === 1 ? value : Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  // Read straight through when motion is off, rather than waiting for an effect to catch up:
  // `useReducedMotion()` is null on the very first render, and a reader who asked for no motion
  // should never see a 0 flash past on the way to the real figure.
  return (
    <span ref={ref} className={className}>
      {format(reduce ? value : shown)}
    </span>
  );
}
