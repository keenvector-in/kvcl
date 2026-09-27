import '@testing-library/jest-dom/vitest';

// jsdom implements neither of these, and motion/react needs both: IntersectionObserver for
// scroll-triggered animation, matchMedia for prefers-reduced-motion. Without them every component
// that animates throws on mount, which would quietly push motion out of the test suite entirely.
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private cb: IntersectionObserverCallback) {}
  // Report the element as visible straight away: a test asserting on what a reader sees should not
  // depend on a scroll that jsdom cannot perform.
  observe(target: Element) {
    this.cb([{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry], this);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
// Only where it is missing: the Storybook project runs in real Chromium, which has a working
// implementation, and replacing it there broke unrelated stories.
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false, // motion on by default; a test that cares sets its own stub
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
