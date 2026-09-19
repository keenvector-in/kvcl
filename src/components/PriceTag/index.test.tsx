import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceTag } from './index';

describe('PriceTag', () => {
  it('shows the price alone when there is no MRP', () => {
    render(<PriceTag priceMinor={149900} />);
    expect(screen.getByText('₹1,499')).toBeInTheDocument();
    expect(screen.queryByText(/off$/)).not.toBeInTheDocument();
  });

  it('shows the MRP and the discount when the MRP is higher', () => {
    render(<PriceTag priceMinor={149900} mrpMinor={199900} />);
    expect(screen.getByText('₹1,999')).toBeInTheDocument();
    expect(screen.getByText('25% off')).toBeInTheDocument();
  });

  it('ignores an MRP that is not higher than the price', () => {
    render(<PriceTag priceMinor={149900} mrpMinor={149900} />);
    expect(screen.queryByText(/off$/)).not.toBeInTheDocument();
  });

  it('keeps paise when the amount is not whole', () => {
    render(<PriceTag priceMinor={149950} />);
    expect(screen.getByText('₹1,499.50')).toBeInTheDocument();
  });
});
