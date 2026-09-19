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
    ['neutral', 'bg-fg/5'],
    ['warning', 'bg-warning-soft'],
    ['success', 'bg-success-soft'],
    ['danger', 'bg-danger-soft'],
    ['error', 'bg-danger-soft'],
    ['info', 'bg-info-soft'],
    ['primary', 'brand-500/15'],
  ] as const)('applies %s tone classes', (tone, expectedClassFragment) => {
    render(<Badge tone={tone}>label</Badge>);
    expect(screen.getByText('label').className).toContain(expectedClassFragment);
  });

  it('shows a leading dot only when asked', () => {
    const { rerender } = render(<Badge tone="success">Live</Badge>);
    expect(screen.getByText('Live').querySelector('span')).toBeNull();
    rerender(
      <Badge tone="success" dot>
        Live
      </Badge>,
    );
    expect(screen.getByText('Live').querySelector('span')).not.toBeNull();
  });
});
