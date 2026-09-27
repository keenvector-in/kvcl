import type { Transition, Variants } from 'motion/react';

/**
 * The shared motion language. Every animation in every portal draws from here, so the platform moves
 * one way rather than four.
 *
 * Three rules this file exists to enforce:
 *
 * 1. **Motion explains, it does not decorate.** Something moves to show where it came from, what
 *    changed, or that the system is working. Nothing moves to look busy.
 * 2. **Only `transform` and `opacity`.** Those are composited by the GPU; animating width, height, top
 *    or box-shadow makes the browser re-layout every frame and turns a nice idea into jank on a cheap
 *    Android phone, which is most of this market.
 * 3. **Reduced motion is honoured everywhere.** `prefers-reduced-motion` is not a niche: it is set by
 *    people who get motion sickness or migraines from parallax and slides. We keep the fade (so the
 *    interface still feels continuous) and drop the travel.
 */

/** Seconds — motion/react speaks seconds, CSS tokens speak milliseconds. */
export const duration = {
  /** A button reacting under the finger. Anything slower feels laggy. */
  instant: 0.12,
  /** The default: a card lifting, a menu opening. */
  base: 0.22,
  /** Something arriving from off-screen, or a panel sliding. */
  slow: 0.36,
  /** Reserved for a first-paint entrance, never for something the user is waiting on. */
  entrance: 0.6
} as const;

/**
 * Easing. `out` for anything arriving (fast then settling, which reads as confident); `in` for
 * anything leaving; `spring` where a thing should feel physical rather than timed.
 */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1]
} as const satisfies Record<string, [number, number, number, number]>;

export const spring = {
  /** A panel or sheet: settles quickly, barely overshoots. */
  panel: { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 },
  /** A small control: snappier, a touch of bounce. */
  control: { type: 'spring', stiffness: 520, damping: 26, mass: 0.6 }
} as const satisfies Record<string, Transition>;

/** How long to wait between siblings in a list. Long enough to read as a sequence, short enough that
 *  the last item is not still arriving after the eye has moved on. */
export const STAGGER = 0.045

/**
 * transition(reduce) — the transition to use for almost everything. Pass the result of
 * `useReducedMotion()`; when it is true the movement is dropped to a quick fade.
 */
export const transition = (reduce: boolean | null, d: number = duration.base): Transition =>
  reduce ? { duration: 0.15, ease: 'linear' } : { duration: d, ease: ease.out };

/** Fade up: the default entrance. `reduce` drops the travel, keeps the fade. */
export const fadeUp = (reduce: boolean | null, y = 12): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : y },
  shown: { opacity: 1, y: 0, transition: transition(reduce) }
});

/** Scale in: for something appearing in place — a badge, a count, a confirmation tick. */
export const popIn = (reduce: boolean | null): Variants => ({
  hidden: { opacity: 0, scale: reduce ? 1 : 0.92 },
  shown: { opacity: 1, scale: 1, transition: reduce ? transition(reduce) : spring.control }
});

/** A list whose children arrive one after another. Pair with `staggerItem`. */
export const staggerList = (reduce: boolean | null, gap = STAGGER): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: reduce ? 0 : gap, delayChildren: reduce ? 0 : 0.02 } }
});

export const staggerItem = (reduce: boolean | null, y = 10): Variants => fadeUp(reduce, y);

/**
 * Page transition: the same shape in every portal, so moving between screens feels like one product.
 * Deliberately short — a screen change should feel instant, and anything over ~250ms starts to feel
 * like the app is thinking.
 */
export const pageTransition = (reduce: boolean | null): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 8 },
  shown: { opacity: 1, y: 0, transition: transition(reduce, duration.base) },
  exit: { opacity: 0, y: reduce ? 0 : -6, transition: transition(reduce, duration.instant) }
});
