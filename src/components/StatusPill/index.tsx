import { Badge } from '../Badge/index';

/** A subset of Badge's tones — `error` is Badge's alias for `danger`. */
export type PillTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export interface StatusPillProps {
  /** The status word (draft, active, archived…). */
  label: string;
  /** Default `neutral`. */
  tone?: PillTone;
  /** Leading dot in the tone's colour, like the prototype's pills. Off by default. */
  dot?: boolean;
  className?: string;
}

/** A record's status as an uppercase pill, so tables scan by shape and colour before reading. */
export function StatusPill({ label, tone = 'neutral', dot = false, className = '' }: StatusPillProps) {
  return (
    <Badge tone={tone} dot={dot} className={`uppercase tracking-wide ${className}`}>
      {label}
    </Badge>
  );
}
