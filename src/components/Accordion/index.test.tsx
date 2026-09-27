import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from './index';

describe('Accordion', () => {
  it('is closed by default and opens from its summary', () => {
    const { container } = render(<Accordion title="About us">body</Accordion>);
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);
    fireEvent.click(screen.getByText('About us'));
    expect(details.open).toBe(true);
  });

  it('starts open with defaultOpen and keeps its body mounted', () => {
    const { container } = render(
      <Accordion title="Contact" description="Shown at /contact" meta="3 questions" defaultOpen>
        <input aria-label="Intro" />
      </Accordion>,
    );
    expect(container.querySelector('details')!.open).toBe(true);
    expect(screen.getByLabelText('Intro')).toBeInTheDocument();
    expect(screen.getByText('Shown at /contact')).toBeInTheDocument();
    expect(screen.getByText('3 questions')).toBeInTheDocument();
  });

  it('passes group through as the native name', () => {
    const { container } = render(<Accordion title="Q1" group="questions">x</Accordion>);
    expect(container.querySelector('details')!.getAttribute('name')).toBe('questions');
  });
});
