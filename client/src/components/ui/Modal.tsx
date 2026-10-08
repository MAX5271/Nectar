import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "./IconButton";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Accessible modal (focus trap, ESC-to-close, scroll lock via Radix) with a warm, on-brand shell. */
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-bone p-6 shadow-warm-lg focus:outline-none",
                  className,
                )}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="font-display text-xl font-semibold text-ink">
                      {title}
                    </Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-1 text-sm text-ink-soft">
                        {description}
                      </Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{title}</Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <IconButton label="Close">
                      <X className="h-5 w-5" />
                    </IconButton>
                  </Dialog.Close>
                </div>
                <div className="mt-5">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
