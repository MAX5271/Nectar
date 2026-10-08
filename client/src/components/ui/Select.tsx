import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-md border bg-bone px-3.5 py-2.5 pr-10 text-ink transition-colors focus:outline-none",
          invalid ? "border-tomato" : "border-line focus:border-beet",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
        aria-hidden="true"
      />
    </div>
  ),
);
Select.displayName = "Select";
