import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContactForm, DEFAULT_CONTACT_FIELDS } from './index';

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('ContactForm', () => {
  it('checks required fields, e-mail and phone before sending', () => {
    const onSubmit = vi.fn();
    render(<ContactForm fields={DEFAULT_CONTACT_FIELDS} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Your name is required')).toBeInTheDocument();
    fill(/Your name/, 'Asha');
    fill(/Message/, 'Do you deliver to Surat?');
    fill(/Phone/, '98765');
    fill(/E-mail/, 'asha at gmail');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Enter a 10-digit mobile number')).toBeInTheDocument();
    expect(screen.getByText(/Enter an e-mail address/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fill(/Phone/, '+91 98250 12345');
    fill(/E-mail/, 'asha@example.in');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Asha', phone: '+91 98250 12345' }), '');
  });

  it('puts a server error that names a question under that question', () => {
    render(<ContactForm fields={DEFAULT_CONTACT_FIELDS} error="Phone is not a phone number" />);
    const phone = screen.getByLabelText(/Phone/);
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText('Phone is not a phone number')).toHaveLength(1); // under the field, not repeated above the button
  });
});
