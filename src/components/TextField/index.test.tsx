import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextArea, TextField } from './index';

describe('TextField', () => {
  it('associates the label and accepts typing', async () => {
    render(<TextField label="Store name" />);
    const input = screen.getByLabelText('Store name');
    await userEvent.type(input, 'Bansal');
    expect(input).toHaveValue('Bansal');
  });

  it('shows the error, marks the field invalid and describes it', () => {
    render(<TextField label="GSTIN" id="gstin" error="Enter a valid GSTIN." />);
    const input = screen.getByLabelText('GSTIN');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'gstin-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid GSTIN.');
  });

  it('keeps a hidden label available to screen readers', () => {
    render(<TextField label="Search" hideLabel />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });
});

describe('TextArea', () => {
  it('links hint and error together in aria-describedby', () => {
    render(<TextArea label="Notes" id="notes" hint="Optional." error="Too long." />);
    expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-describedby', 'notes-hint notes-error');
  });
});
