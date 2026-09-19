import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './index';

describe('Switch', () => {
  it('exposes a switch role with the label and reflects checked', () => {
    render(<Switch label="Accept online payments" checked readOnly />);
    expect(screen.getByRole('switch', { name: 'Accept online payments' })).toBeChecked();
  });

  it('reports the change and keeps a hidden label accessible', async () => {
    const onChange = vi.fn();
    render(<Switch label="Accept online payments" hideLabel onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch', { name: 'Accept online payments' }));
    expect(onChange).toHaveBeenCalled();
  });
});
