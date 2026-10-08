import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "../../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  className?: string;
}

/** Accessible multi-way toggle (roving tabindex, arrow-key navigation) for small, mutually exclusive choices. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAndSelect = (index: number) => {
    const option = options[index];
    refs.current[index]?.focus();
    onChange(option.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusAndSelect((index + 1) % options.length);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusAndSelect((index - 1 + options.length) % options.length);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn("grid gap-3", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-lg border px-4 py-3 text-left transition-all",
              selected
                ? "border-beet bg-beet/10 text-beet shadow-warm-sm"
                : "border-line bg-bone text-ink-soft hover:border-beet/40 hover:text-ink",
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            {option.description && (
              <span className="mt-0.5 block text-xs text-ink-soft">{option.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
