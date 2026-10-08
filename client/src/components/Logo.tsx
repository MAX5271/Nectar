import { NectarDroplet } from "./nectar/NectarDroplet";
import { cn } from "../lib/cn";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone-light border border-line shadow-warm-sm">
        <NectarDroplet state="filled" color="honey" size="sm" className="transform -rotate-12" />
      </span>
      {!iconOnly && (
        <span className="font-display text-2xl font-medium tracking-tight text-ink">Nectar</span>
      )}
    </span>
  );
}

