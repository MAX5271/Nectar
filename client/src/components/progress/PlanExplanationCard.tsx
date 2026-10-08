import React, { useEffect, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import api from '../../services/api';
import type { PlanExplanationDTO } from '@nectar/types';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

export const PlanExplanationCard: React.FC = () => {
  const [explanation, setExplanation] = useState<PlanExplanationDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      try {
        const res = await api.get('/diet/explain');
        if (res.data.success && res.data.data) {
          setExplanation(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch plan explanation', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExplanation();
  }, []);

  if (isLoading) {
    return (
      <Card variant="quiet" padding="md">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </Card>
    );
  }

  if (!explanation) return null;

  return (
    <Card variant="quiet" padding="md">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-sm font-semibold text-ink">How we calculated this</h2>
        <ChevronDown className={cn('h-4 w-4 text-ink-soft transition-transform', isOpen && 'rotate-180')} />
      </button>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-md bg-linen p-2.5">
          <span className="block text-[10px] font-medium uppercase text-ink-soft">Base BMR</span>
          <span className="text-sm font-semibold text-ink">{explanation.bmr} kcal</span>
        </div>
        <div className="rounded-md bg-linen p-2.5">
          <span className="block text-[10px] font-medium uppercase text-ink-soft">Activity TDEE</span>
          <span className="text-sm font-semibold text-ink">{explanation.tdee} kcal</span>
        </div>
        <div className="rounded-md bg-linen p-2.5">
          <span className="block text-[10px] font-medium uppercase text-ink-soft">Target intake</span>
          <span className="text-sm font-semibold text-beet">{explanation.targetCalories} kcal</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2 border-t border-line pt-3 text-sm text-ink-soft">
              <div className="flex justify-between">
                <span>Activity multiplier ({explanation.activityLevel})</span>
                <span className="text-ink">×{explanation.activityMultiplier}</span>
              </div>
              <div className="flex justify-between">
                <span>Goal adjustment ({explanation.goal})</span>
                <span className={explanation.goalAdjustment < 0 ? 'text-tomato' : 'text-herb-dark'}>
                  {explanation.goalAdjustment > 0 ? '+' : ''}{explanation.goalAdjustment} kcal
                </span>
              </div>

              {explanation.safetyFloorApplied && (
                <p className="flex items-start gap-1.5 pt-1 text-xs text-turmeric-dark">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  A 1,200 kcal safety floor was applied to keep this plan realistic.
                </p>
              )}

              <div className="border-t border-line pt-3">
                <span className="mb-2 block text-xs font-medium uppercase text-ink-soft">Macro split</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-linen p-2 text-beet">
                    <span className="block font-semibold">Protein</span>
                    <span>{explanation.macroSplit.proteinGrams}g ({explanation.macroSplit.proteinPct}%)</span>
                  </div>
                  <div className="rounded-md bg-linen p-2 text-turmeric-dark">
                    <span className="block font-semibold">Carbs</span>
                    <span>{explanation.macroSplit.carbsGrams}g ({explanation.macroSplit.carbsPct}%)</span>
                  </div>
                  <div className="rounded-md bg-linen p-2 text-herb-dark">
                    <span className="block font-semibold">Fat</span>
                    <span>{explanation.macroSplit.fatGrams}g ({explanation.macroSplit.fatPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
