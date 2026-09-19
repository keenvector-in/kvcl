import { Badge, type BadgeTone } from '../Badge/index';

/** Inventory's stock status (`domain.StatusFor` in the inventory service). */
export type StockBadgeStatus = 'in_stock' | 'low' | 'out' | 'untracked';

export interface StockBadgeProps {
  /** From the inventory API. The client never derives availability itself. */
  status: StockBadgeStatus;
  /** Units available, from the same response. Shown as "Only N left" when status is `low`. */
  available?: number;
  className?: string;
}

const LOOK: Record<StockBadgeStatus, { tone: BadgeTone; label: string }> = {
  in_stock: { tone: 'success', label: 'In stock' },
  low: { tone: 'warning', label: 'Low stock' },
  out: { tone: 'danger', label: 'Out of stock' },
  untracked: { tone: 'neutral', label: 'In stock' },
};

/** Stock status pill. */
export function StockBadge({ status, available, className = '' }: StockBadgeProps) {
  const { tone, label } = LOOK[status];
  return (
    <Badge tone={tone} className={className}>
      {status === 'low' && available !== undefined ? `Only ${available} left` : label}
    </Badge>
  );
}
