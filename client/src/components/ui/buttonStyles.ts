import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  "inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 ease-[cubic-bezier(.2,.8,.2,1)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-beet text-bone shadow-warm-sm hover:bg-beet-dark",
        secondary: "border border-line bg-bone text-ink hover:border-beet hover:text-beet",
        ghost: "text-ink-soft hover:bg-linen hover:text-ink",
        destructive: "bg-tomato text-bone hover:bg-tomato/90",
      },
      size: {
        sm: "px-3.5 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
