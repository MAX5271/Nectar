import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'protein' | 'carb' | 'fat' | 'calorie' | 'neutral' | 'subtle';

export interface NectarBadgeProps {
  variant?: BadgeVariant;
  label?: string;
  value?: string | number;
  unit?: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  protein: {
    bg: 'bg-beet-subtle/80',
    text: 'text-beet',
    border: 'border-beet/25',
  },
  carb: {
    bg: 'bg-turmeric-subtle/80',
    text: 'text-turmeric-dark',
    border: 'border-turmeric/30',
  },
  fat: {
    bg: 'bg-herb-subtle/80',
    text: 'text-herb',
    border: 'border-herb/30',
  },
  calorie: {
    bg: 'bg-honey-subtle/80',
    text: 'text-honey-dark',
    border: 'border-honey/30',
  },
  neutral: {
    bg: 'bg-bone-light',
    text: 'text-ink-muted',
    border: 'border-line',
  },
  subtle: {
    bg: 'bg-bone-subtle/60',
    text: 'text-ink',
    border: 'border-line/60',
  },
};

export const NectarBadge: React.FC<NectarBadgeProps> = ({
  variant = 'neutral',
  label,
  value,
  unit,
  children,
  className,
  size = 'sm',
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono tracking-tight font-medium rounded-full border px-2 py-0.5 transition-colors select-none',
        size === 'sm' ? 'text-[11px] leading-tight' : 'text-xs px-2.5 py-1',
        styles.bg,
        styles.text,
        styles.border,
        className,
      )}
    >
      {label && <span className="opacity-75 font-semibold mr-0.5">{label}</span>}
      {value !== undefined && <span>{value}</span>}
      {unit && <span className="text-[10px] opacity-75">{unit}</span>}
      {children}
    </span>
  );
};
