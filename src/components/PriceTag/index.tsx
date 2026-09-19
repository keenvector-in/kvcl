import { formatMinor } from '../../lib/money';

export interface PriceTagProps {
  /** Selling price in paise, from pricing. */
  priceMinor: number;
  /** MRP in paise. Shown struck through with the discount when higher than the price. */
  mrpMinor?: number;
  /** ISO 4217 code. Default INR. */
  currency?: string;
  /** Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<PriceTagProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
};

/** Price with optional MRP and "N% off". Shows server numbers; computes nothing payable. */
export function PriceTag({ priceMinor, mrpMinor, currency = 'INR', size = 'md', className = '' }: PriceTagProps) {
  const discounted = mrpMinor !== undefined && mrpMinor > priceMinor;
  const pct = discounted ? Math.round(((mrpMinor - priceMinor) / mrpMinor) * 100) : 0;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`font-extrabold tracking-tight tabular-nums text-fg ${SIZE[size]}`}>
        {formatMinor(priceMinor, currency)}
      </span>
      {discounted ? (
        <>
          <span className="text-sm text-fg-subtle line-through tabular-nums">
            <span className="sr-only">MRP </span>
            {formatMinor(mrpMinor, currency)}
          </span>
          <span className="rounded-md bg-success-soft px-1.5 py-0.5 text-sm font-bold text-success">{pct}% off</span>
        </>
      ) : null}
    </span>
  );
}
