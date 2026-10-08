import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

export type DropletState = 'hollow' | 'filled' | 'active' | 'moving';
export type DropletColor = 'honey' | 'herb' | 'beet' | 'turmeric' | 'ink' | 'line';
export type DropletSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface NectarDropletProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  state?: DropletState;
  color?: DropletColor;
  size?: DropletSize;
  className?: string;
  pulse?: boolean;
}

const sizeMap: Record<DropletSize, { w: number; h: number; stroke: number }> = {
  xs: { w: 10, h: 14, stroke: 2.2 },
  sm: { w: 14, h: 19, stroke: 2.2 },
  md: { w: 20, h: 27, stroke: 2 },
  lg: { w: 28, h: 38, stroke: 1.8 },
  xl: { w: 40, h: 54, stroke: 1.6 },
};

const colorMap: Record<DropletColor, { stroke: string; fill: string; glow: string }> = {
  honey: {
    stroke: 'text-honey',
    fill: 'fill-honey text-honey',
    glow: 'rgba(184, 117, 50, 0.25)',
  },
  herb: {
    stroke: 'text-herb',
    fill: 'fill-herb text-herb',
    glow: 'rgba(82, 104, 79, 0.25)',
  },
  beet: {
    stroke: 'text-beet',
    fill: 'fill-beet text-beet',
    glow: 'rgba(110, 48, 64, 0.25)',
  },
  turmeric: {
    stroke: 'text-turmeric',
    fill: 'fill-turmeric text-turmeric',
    glow: 'rgba(212, 154, 50, 0.25)',
  },
  ink: {
    stroke: 'text-ink',
    fill: 'fill-ink text-ink',
    glow: 'rgba(32, 35, 30, 0.2)',
  },
  line: {
    stroke: 'text-line',
    fill: 'fill-line text-line',
    glow: 'rgba(222, 210, 184, 0.3)',
  },
};

export const NectarDroplet: React.FC<NectarDropletProps> = ({
  state = 'hollow',
  color = 'honey',
  size = 'md',
  pulse = false,
  className,
  ...props
}) => {
  const { w, h, stroke } = sizeMap[size];
  const colorStyles = colorMap[color];
  const isFilled = state === 'filled';
  const isActive = state === 'active';

  return (
    <motion.div
      className={cn('relative inline-flex items-center justify-center shrink-0 select-none', className)}
      style={{ width: w, height: h }}
      animate={
        pulse || isActive
          ? {
              scale: [1, 1.08, 1],
              transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
            }
          : undefined
      }
      {...props}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('transition-all duration-300 ease-out', colorStyles.stroke)}
      >
        <path
          d="M12 2C12 2 2 13.5 2 20C2 25.5228 6.47715 30 12 30C17.5228 30 22 25.5228 22 20C22 13.5 12 2Z"
          className={cn(
            'transition-all duration-300',
            isFilled ? colorStyles.fill : 'fill-none',
          )}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Subtle organic core highlight for filled state */}
        {isFilled && (
          <ellipse
            cx="12"
            cy="21"
            rx="3.5"
            ry="4.5"
            fill="rgba(255, 255, 255, 0.3)"
            className="transition-opacity duration-300"
          />
        )}
      </svg>
    </motion.div>
  );
};
