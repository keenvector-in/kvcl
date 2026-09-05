import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './index';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>Coming soon</Badge>);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it.each([
    ['brand', 'brand-500/15'],
    ['accent', 'accent-500/15'],
    ['neutral', 'bg-white/5'],
    ['warning', 'amber-500/15'],
  ] as const)('applies %s tone classes', (tone, expectedClassFragment) => {
    render(<Badge tone={tone}>label</Badge>);
    expect(screen.getByText('label').className).toContain(expectedClassFragment);
  });
});
