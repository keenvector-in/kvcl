import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './index';

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Business email" />);
    expect(screen.getByLabelText('Business email')).toBeInTheDocument();
  });

  it('accepts typed input', async () => {
    render(<Input label="Business email" />);
    const input = screen.getByLabelText('Business email');
    await userEvent.type(input, 'hi@keenvector.com');
    expect(input).toHaveValue('hi@keenvector.com');
  });

  it('marks the field invalid and describes it with the error message', () => {
    render(<Input label="Business email" error="Enter a valid email address." />);
    const input = screen.getByLabelText('Business email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });
});
