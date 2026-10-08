import { cn } from "../../lib/cn";

/** Pulsing placeholder block for content that's still loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-line/60", className)}
      aria-hidden="true"
    />
  );
}
