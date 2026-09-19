import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './index';

describe('Checkbox', () => {
  it('toggles through its label and reports the change', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Track inventory" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Track inventory'));
    expect(onChange).toHaveBeenCalled();
  });

  it('honours disabled', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Track inventory" disabled onChange={onChange} />);
    const box = screen.getByLabelText('Track inventory');
    expect(box).toBeDisabled();
    await userEvent.click(box);
    expect(onChange).not.toHaveBeenCalled();
  });
});
