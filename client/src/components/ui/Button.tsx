import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";
import { buttonStyles } from "./buttonStyles";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
