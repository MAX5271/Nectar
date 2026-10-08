import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const cardStyles = cva("", {
  variants: {
    variant: {
      /** Default surface: quiet border + soft warm shadow. */
      quiet: "rounded-lg border border-line bg-bone shadow-warm-sm",
      /** For a card that needs to stand out as a highlighted/primary action area. */
      accent: "rounded-lg border border-beet/15 border-l-4 border-l-beet bg-bone shadow-warm-md",
      /** Flatter list-row treatment — for repeated items (meals, history rows) rather than boxed panels. */
      flat: "rounded-md border border-line/70 bg-bone/70",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: { variant: "quiet", padding: "md" },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardStyles({ variant, padding }), className)} {...props} />;
}
