import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Labeled wrapper for a form control, with a shared spot for an error or hint message. */
export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-sm text-tomato">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
