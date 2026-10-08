import React, { useEffect, useState } from 'react';
import { Check, Repeat } from 'lucide-react';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';
import { SwapMealModal } from './SwapMealModal';
import { NectarDroplet } from '../nectar/NectarDroplet';
import { NectarBadge } from '../ui/NectarBadge';
import api from '../../services/api';
import { notify } from '../../lib/toast';
import { cn } from '../../lib/utils';

export interface MealCardProps {
  meal: DietMealDTO;
  onMealSwapped: (swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => void;
  onAdherenceLogged?: () => void;
  initialAdhered?: boolean;
  timeSlot?: string;
  className?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onMealSwapped,
  onAdherenceLogged,
  initialAdhered = false,
  timeSlot,
  className,
}) => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isAdhered, setIsAdhered] = useState(initialAdhered);
  const [isLogging, setIsLogging] = useState(false);

  // Sync when parent server state resolves
  useEffect(() => {
    setIsAdhered(initialAdhered);
  }, [initialAdhered]);

  const handleToggleAdherence = async () => {
    setIsLogging(true);
    const nextState = !isAdhered;
    try {
      await api.post('/tracking/meals', {
        name: meal.meal,
        mealType: meal.mealType || meal.type || 'LUNCH',
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carb,
        fat: meal.fat,
        adhered: nextState,
        dietPlanId: meal.dietPlanId,
      });
      setIsAdhered(nextState);
      onAdherenceLogged?.();
    } catch {
      notify.error("Couldn't save adherence. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const mealTypeLabel = (meal.mealType || meal.type || 'MEAL').toUpperCase();

  return (
    <>
      <div
        className={cn(
          'group relative rounded-2xl border transition-all duration-300 p-5 sm:p-6 bg-bone-light/80 shadow-warm-sm',
          isAdhered
            ? 'border-herb/40 bg-herb-subtle/30 shadow-none'
            : 'border-line hover:border-line-subtle hover:shadow-warm-md hover:bg-bone-light',
          className,
        )}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left: Meal Meta & Protagonist Title */}
          <div className="flex-1 min-w-0">
            {/* Header: Slot + Type Tag + Adherence Indicator */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {timeSlot && (
                <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                  {timeSlot}
                </span>
              )}
              {timeSlot && <span className="text-line">•</span>}
              <span className="text-[11px] font-mono font-semibold tracking-wider text-honey-dark uppercase">
                {mealTypeLabel}
              </span>

              {isAdhered && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-herb font-medium bg-herb-subtle px-2 py-0.5 rounded-full border border-herb/25">
                  <Check className="h-3 w-3" /> Logged
                </span>
              )}
            </div>

            {/* Protagonist Meal Title */}
            <h3
              className={cn(
                'font-display text-xl sm:text-2xl font-normal tracking-tight text-ink transition-all',
                isAdhered && 'text-ink-muted/80 line-through decoration-herb/40',
              )}
            >
              {meal.meal}
            </h3>

            {/* Portion / Serving size */}
            <p className="mt-1 text-sm font-sans text-ink-muted">
              {meal.portion}
            </p>

            {/* Monospaced Nutrition Data Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <NectarBadge variant="calorie" size="sm">
                <span className="font-semibold">{meal.calories}</span> kcal
              </NectarBadge>
              <NectarBadge variant="protein" size="sm">
                P <span className="font-semibold ml-0.5">{meal.protein}g</span>
              </NectarBadge>
              <NectarBadge variant="carb" size="sm">
                C <span className="font-semibold ml-0.5">{meal.carb}g</span>
              </NectarBadge>
              <NectarBadge variant="fat" size="sm">
                F <span className="font-semibold ml-0.5">{meal.fat}g</span>
              </NectarBadge>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:self-start shrink-0 pt-1">
            {/* Adherence Button (Accessible and matching test contract: 'Mark eaten' / 'Eaten') */}
            <button
              onClick={handleToggleAdherence}
              disabled={isLogging}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-medium transition-all duration-200 select-none cursor-pointer',
                'focus-visible:outline-2 focus-visible:outline-beet focus-visible:outline-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isAdhered
                  ? 'bg-herb text-bone hover:bg-herb-dark shadow-warm-sm'
                  : 'bg-bone text-ink border border-line hover:border-herb/60 hover:text-herb shadow-warm-sm',
              )}
            >
              <NectarDroplet
                state={isAdhered ? 'filled' : 'hollow'}
                color={isAdhered ? 'herb' : 'ink'}
                size="xs"
              />
              <span>{isAdhered ? 'Eaten' : 'Mark eaten'}</span>
            </button>

            {/* Swap Meal Button */}
            <button
              onClick={() => setIsSwapModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-sans font-medium text-ink-muted hover:text-ink hover:bg-bone border border-line transition-colors select-none"
              title="Swap this meal"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>Swap</span>
            </button>
          </div>
        </div>
      </div>

      <SwapMealModal
        meal={meal}
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onMealSwapped={onMealSwapped}
      />
    </>
  );
};
