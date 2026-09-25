import { Badge, type BadgeTone } from '../Badge/index';

/** Inventory's stock status (`domain.StatusFor` in the inventory service). */
export type StockBadgeStatus = 'in_stock' | 'low' | 'out' | 'untracked';

export interface StockBadgeProps {
  /** From the inventory API. The client never derives availability itself. */
  status: StockBadgeStatus;
  /** Units available, from the same response. Shown as "Only N left" when status is `low`. */
  available?: number;
  /**
   * What to call a SKU whose stock isn't tracked. A shopper only needs to know they can buy it
   * ("In stock", the default); an owner's inventory screen should say "Not tracked".
   */
  untrackedLabel?: string;
  className?: string;
}

const LOOK: Record<StockBadgeStatus, { tone: BadgeTone; label: string }> = {
  in_stock: { tone: 'success', label: 'In stock' },
  low: { tone: 'warning', label: 'Low stock' },
  out: { tone: 'danger', label: 'Out of stock' },
  untracked: { tone: 'neutral', label: 'In stock' },
};

/** Stock status pill. */
export function StockBadge({ status, available, untrackedLabel, className = '' }: StockBadgeProps) {
  const { tone, label } = LOOK[status];
  const text =
    status === 'low' && available !== undefined
      ? `Only ${available} left`
      : status === 'untracked' && untrackedLabel
        ? untrackedLabel
        : label;
  return (
    <Badge tone={tone} className={className}>
      {text}
    </Badge>
  );
}
