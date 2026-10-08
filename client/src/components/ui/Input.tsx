import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border bg-bone px-3.5 py-2.5 text-ink placeholder:text-ink-soft/50 transition-colors focus:outline-none",
        invalid ? "border-tomato" : "border-line focus:border-beet",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = "Input";
