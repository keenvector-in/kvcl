export interface TenantIdDisplayProps {
  /** The caller's actual tenant. Never selected or inferred here. */
  tenantId?: string | null;
  /** Text when there is no tenant. Default "Not selected". */
  emptyLabel?: string;
  /** `box`: bordered block (default). `inline`: one small muted line for headers and footers. */
  variant?: 'box' | 'inline';
  className?: string;
}

/** Shows the tenant context the page is operating in; the ID is selectable for copying into support tickets. */
export function TenantIdDisplay({
  tenantId,
  emptyLabel = 'Not selected',
  variant = 'box',
  className = '',
}: TenantIdDisplayProps) {
  const box = variant === 'box';
  return (
    <div
      className={`[overflow-wrap:anywhere] text-xs ${
        box ? 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg' : 'text-fg-muted'
      } ${className}`}
    >
      <span className="text-fg-muted">Tenant ID: </span>
      {tenantId ? <code className="select-all font-mono">{tenantId}</code> : <span>{emptyLabel}</span>}
    </div>
  );
}
