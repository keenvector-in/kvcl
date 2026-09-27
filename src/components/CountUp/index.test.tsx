import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CountUp } from './index';

// motion/react reads prefers-reduced-motion once, when the module loads, so a per-test matchMedia stub
// comes too late. Mocking the hook is the only way to exercise both branches — and the branch matters:
// someone who asked for no motion must get the real figure, not a 0 that climbs.
const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => reducedMotion.value,
  useInView: () => true,
}));

describe('CountUp', () => {
  beforeEach(() => {
    reducedMotion.value = false;
  });

  // The count runs on requestAnimationFrame, which jsdom drives off a timer — real time makes this
  // flaky on a loaded machine, so drive the clock instead of waiting on it.
  const runAnimation = (ms = 1200) => act(() => void vi.advanceTimersByTime(ms));

  it('lands exactly on the value — a figure on a dashboard is a claim, not a flourish', () => {
    vi.useFakeTimers();
    try {
      render(<CountUp value={28772} />);
      runAnimation();
      expect(screen.getByText('28,772')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the final number immediately when the reader asked for less motion', () => {
    reducedMotion.value = true;
    render(<CountUp value={1499} />);
    expect(screen.getByText('1,499')).toBeInTheDocument();
  });

  it('formats through the caller, so money keeps its symbol', () => {
    vi.useFakeTimers();
    try {
      render(<CountUp value={42990} format={(n) => `₹${n.toLocaleString('en-IN')}`} />);
      runAnimation();
      expect(screen.getByText('₹42,990')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('handles zero without counting from anywhere', () => {
    render(<CountUp value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
