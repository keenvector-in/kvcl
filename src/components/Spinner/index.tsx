export interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-fg/20 border-t-brand-500 ${className}`}
    />
  );
}
