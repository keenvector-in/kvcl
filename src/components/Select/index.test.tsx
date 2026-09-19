import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './index';

const options = [
  { value: 'blr', label: 'Bengaluru' },
  { value: 'del', label: 'Delhi', disabled: true },
];

describe('Select', () => {
  it('renders the placeholder and options, and reports changes', async () => {
    const onChange = vi.fn();
    render(<Select label="Warehouse" placeholder="Choose one" options={options} value="" onChange={onChange} />);
    const select = screen.getByLabelText('Warehouse');
    expect(screen.getByRole('option', { name: 'Choose one' })).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Delhi' })).toBeDisabled();
    await userEvent.selectOptions(select, 'blr');
    expect(onChange).toHaveBeenCalled();
  });

  it('marks the field invalid and announces the error', () => {
    render(<Select label="Warehouse" id="wh" options={options} error="Pick a warehouse." />);
    const select = screen.getByLabelText('Warehouse');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', 'wh-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a warehouse.');
  });

  it('falls back to option children when no options are given', () => {
    render(
      <Select label="Region">
        <option value="north">North</option>
      </Select>,
    );
    expect(screen.getByRole('option', { name: 'North' })).toBeInTheDocument();
  });
});
