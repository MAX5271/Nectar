import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NectarDroplet } from './NectarDroplet';
import { Sparkles, Check } from 'lucide-react';

export interface NectarGenerationModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const steps = [
  { id: 'goals', label: 'Analyzing biometrics & metabolic targets' },
  { id: 'macros', label: 'Balancing optimal protein & energy macros' },
  { id: 'recipes', label: 'Selecting whole ingredients & chef formulations' },
  { id: 'timeline', label: 'Assembling chronological daily timeline' },
];

export const NectarGenerationModal: React.FC<NectarGenerationModalProps> = ({
  isOpen,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full max-w-md rounded-3xl border border-line bg-bone-light p-6 sm:p-8 shadow-warm-lg z-10"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-line">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-honey-dark font-medium bg-honey-subtle px-3 py-1 rounded-full border border-honey/25">
              <Sparkles className="h-3.5 w-3.5" />
              Nectar Synthesis
            </span>
            <h3 className="mt-3 font-display text-2xl font-normal text-ink">
              Crafting Today's Protocol
            </h3>
            <p className="mt-1 text-xs font-sans text-ink-muted">
              Calibrating nutrients precisely to your physiology
            </p>
          </div>

          {/* Stepper with Nectar Line & Traveling Droplet */}
          <div className="mt-6 relative pl-8 py-2 space-y-6">
            {/* The vertical Nectar Line rail */}
            <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-line" aria-hidden="true" />

            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="relative flex items-center gap-3">
                  {/* Step node on line */}
                  <div
                    className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-bone-light border border-line z-10 transition-colors"
                  >
                    {isPast ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-herb text-bone">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    ) : isCurrent ? (
                      <NectarDroplet state="filled" color="honey" size="xs" pulse />
                    ) : (
                      <NectarDroplet state="hollow" color="line" size="xs" />
                    )}
                  </div>

                  {/* Step label */}
                  <span
                    className={`text-xs font-sans transition-all duration-300 ${
                      isCurrent
                        ? 'font-medium text-ink'
                        : isPast
                        ? 'text-ink-muted line-through opacity-75'
                        : 'text-ink-muted/50'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
