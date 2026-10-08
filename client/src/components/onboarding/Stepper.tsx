import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

export interface StepperProps {
  steps: string[];
  current: number;
}

/** Horizontal progress indicator for a genuine multi-step sequence. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < current;
        const isCurrent = stepNumber === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete && "bg-herb text-bone",
                  isCurrent && "bg-beet text-bone",
                  !isComplete && !isCurrent && "bg-line text-ink-soft",
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : stepNumber}
              </span>
              <span className={cn("hidden text-sm sm:block", isCurrent ? "font-medium text-ink" : "text-ink-soft")}>
                {label}
              </span>
            </div>
            {stepNumber < steps.length && <span className="mx-3 h-px flex-1 bg-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
