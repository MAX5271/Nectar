import React from 'react';
import { cn } from '../../lib/utils';

export interface NectarProgressProps {
  value: number; // Current value
  max: number; // Target / max value
  variant?: 'protein' | 'carb' | 'fat' | 'calorie' | 'ink';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}

const colorMap = {
  protein: 'bg-beet',
  carb: 'bg-turmeric',
  fat: 'bg-herb',
  calorie: 'bg-honey',
  ink: 'bg-ink',
};

export const NectarProgress: React.FC<NectarProgressProps> = ({
  value,
  max,
  variant = 'ink',
  className,
  size = 'md',
  showPercent = false,
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const isOver = max > 0 && value > max;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-3';

  return (
    <div className={cn('w-full select-none', className)}>
      <div
        className={cn(
          'w-full bg-bone-subtle rounded-full overflow-hidden relative border border-line/40',
          heightClass,
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[variant],
            isOver && 'opacity-90',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercent && (
        <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-ink-muted">
          <span>{Math.round(percentage)}%</span>
          <span>
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
};
