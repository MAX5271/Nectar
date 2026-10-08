import React from 'react';
import { cn } from '../../lib/utils';

export interface NectarLineProps {
  orientation?: 'vertical' | 'horizontal';
  variant?: 'solid' | 'dashed' | 'gradient';
  className?: string;
  length?: string | number;
}

export const NectarLine: React.FC<NectarLineProps> = ({
  orientation = 'vertical',
  variant = 'solid',
  className,
  length,
}) => {
  const isVertical = orientation === 'vertical';

  const style: React.CSSProperties = isVertical
    ? { height: length ?? '100%', width: '2px' }
    : { width: length ?? '100%', height: '2px' };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        'shrink-0 select-none transition-colors duration-300',
        isVertical ? 'w-0.5' : 'h-0.5',
        variant === 'solid' && 'bg-line',
        variant === 'dashed' && (isVertical ? 'border-l-2 border-dashed border-line bg-transparent' : 'border-t-2 border-dashed border-line bg-transparent'),
        variant === 'gradient' &&
          (isVertical
            ? 'bg-gradient-to-b from-line via-turmeric/30 to-line'
            : 'bg-gradient-to-r from-line via-turmeric/30 to-line'),
        className,
      )}
    />
  );
};
