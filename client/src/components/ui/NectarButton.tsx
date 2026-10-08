import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NectarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NectarButton = React.forwardRef<HTMLButtonElement, NectarButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        className={cn(
          'relative inline-flex items-center justify-center font-sans font-medium transition-all duration-200 select-none cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-beet focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
          // Sizes
          size === 'sm' && 'text-xs px-3 py-1.5 rounded-full gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 rounded-full gap-2',
          size === 'lg' && 'text-base px-6 py-3 rounded-full gap-2.5',
          // Variants
          variant === 'primary' &&
            'bg-ink text-bone hover:bg-ink/90 shadow-warm-sm border border-transparent',
          variant === 'secondary' &&
            'bg-bone-light text-ink border border-line hover:border-ink/30 hover:bg-bone shadow-warm-sm',
          variant === 'accent' &&
            'bg-beet text-bone hover:bg-beet-dark shadow-warm-sm border border-transparent',
          variant === 'outline' &&
            'bg-transparent text-ink border border-line hover:bg-bone-subtle/50',
          variant === 'ghost' &&
            'bg-transparent text-ink-muted hover:text-ink hover:bg-bone-subtle/40',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

NectarButton.displayName = 'NectarButton';
