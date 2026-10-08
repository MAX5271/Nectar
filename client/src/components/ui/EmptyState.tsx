import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** For a screen or panel with nothing in it yet — states what's missing and what to do about it. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-bone/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linen text-beet">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
