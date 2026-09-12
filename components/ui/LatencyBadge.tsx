/**
 * LatencyBadge - Display latency with color coding
 * Following Liquid Glass design system
 */

import { memo, useMemo } from 'react';
import { getLatencyInfo } from '@/lib/utils/latency';

interface LatencyBadgeProps {
  latency: number;
  className?: string;
}

export const LatencyBadge = memo(function LatencyBadge({ latency, className = '' }: LatencyBadgeProps) {
  // Memoize the latency info calculation
  const info = useMemo(() => getLatencyInfo(latency), [latency]);

  const levelStyles = {
    excellent: 'bg-success/20 border-success text-success',
    good: 'bg-success-light/20 border-success-light text-success-light',
    fair: 'bg-warning/20 border-warning text-warning',
    slow: 'bg-danger/20 border-danger text-danger',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5
        rounded-full
        text-2xs font-mono font-semibold
        border
        transform-gpu
        ${levelStyles[info.level]}
        ${className}
      `}
      title={`Response time: ${info.label} (${info.level})`}
      aria-label={`Latency: ${info.label}`}
    >
      {info.label}
    </span>
  );
});
