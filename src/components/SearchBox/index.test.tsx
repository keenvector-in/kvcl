import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBox } from './index';

describe('SearchBox', () => {
  it('is controlled and calls onChange with the new text', async () => {
    const onChange = vi.fn();
    render(<SearchBox value="ab" onChange={onChange} />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveValue('ab');
    await userEvent.type(input, 'c');
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('uses a custom label and renders the icon', () => {
    render(<SearchBox value="" onChange={() => {}} label="Find products" icon={<span>icon</span>} />);
    expect(screen.getByLabelText('Find products')).toBeInTheDocument();
    expect(screen.getByText('icon')).toBeInTheDocument();
  });
});
