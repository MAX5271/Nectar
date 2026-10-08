import React from 'react';
import { NectarDroplet } from './NectarDroplet';
import { cn } from '../../lib/utils';

export interface NectarMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const NectarMark: React.FC<NectarMarkProps> = ({
  className,
  size = 'md',
  showText = true,
}) => {
  const dropletSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      <div className="relative flex items-center justify-center p-1.5 rounded-full bg-bone-light border border-line shadow-warm-sm group-hover:border-honey/60 transition-colors">
        <NectarDroplet
          state="filled"
          color="honey"
          size={dropletSize}
          className="transform -rotate-12 transition-transform duration-300 group-hover:rotate-0"
        />
      </div>
      {showText && (
        <span className={cn('font-display font-medium tracking-tight text-ink', textSize)}>
          Nectar
        </span>
      )}
    </div>
  );
};
