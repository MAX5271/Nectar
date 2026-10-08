import { Toaster as Sonner } from "sonner";

/** Single toast host, mounted once in AppLayout. Use `notify` from `src/lib/toast.ts` to fire toasts. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-bone)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-warm-md)",
          fontFamily: "var(--font-sans)",
        },
        classNames: {
          error: "!border-tomato/40",
          success: "!border-herb/40",
        },
      }}
    />
  );
}
