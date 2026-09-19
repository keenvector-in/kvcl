import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Radio } from './index';

describe('Radio', () => {
  it('selects one radio at a time within a name group', async () => {
    render(
      <>
        <Radio name="pay" value="cod" label="Cash on delivery" defaultChecked />
        <Radio name="pay" value="online" label="Pay online" />
      </>,
    );
    await userEvent.click(screen.getByLabelText('Pay online'));
    expect(screen.getByLabelText('Pay online')).toBeChecked();
    expect(screen.getByLabelText('Cash on delivery')).not.toBeChecked();
  });
});
