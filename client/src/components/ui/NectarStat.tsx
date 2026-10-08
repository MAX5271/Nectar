import React from 'react';
import { cn } from '../../lib/utils';

export interface NectarStatProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NectarStat: React.FC<NectarStatProps> = ({
  label,
  value,
  unit,
  delta,
  className,
  size = 'md',
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-[11px] uppercase tracking-wider font-mono text-ink-muted/80 font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span
          className={cn(
            'font-mono font-medium tracking-tight text-ink tabular-nums',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-3xl',
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-ink-muted font-normal lowercase">{unit}</span>
        )}
      </div>
      {delta && (
        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono">
          <span
            className={cn(
              delta.trend === 'up' && 'text-herb',
              delta.trend === 'down' && 'text-beet',
              delta.trend === 'neutral' && 'text-ink-muted',
            )}
          >
            {delta.trend === 'up' && '↑'}
            {delta.trend === 'down' && '↓'} {delta.value}
          </span>
          {delta.label && <span className="text-ink-faint">{delta.label}</span>}
        </div>
      )}
    </div>
  );
};
