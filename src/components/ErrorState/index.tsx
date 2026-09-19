import { Button } from '../Button/index';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center ${className}`}
    >
      <p className="text-sm font-medium text-red-500">{title}</p>
      <p className="text-sm text-fg-subtle">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="md" className="mt-2" onClick={onRetry} type="button">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
