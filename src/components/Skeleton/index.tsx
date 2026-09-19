import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Number = px. Default 100%. */
  width?: number | string;
  /** Number = px. Default 16px. */
  height?: number | string;
  /** Corner radius; default a small rounded corner. */
  radius?: number | string;
}

/** Placeholder in the shape of content that is loading. Hidden from screen readers; announce loading elsewhere. */
export function Skeleton({ width = '100%', height = 16, radius, className = '', style, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-sunken motion-reduce:animate-none ${className}`}
      style={{ width, height, ...(radius !== undefined ? { borderRadius: radius } : {}), ...style }}
      {...rest}
    />
  );
}
