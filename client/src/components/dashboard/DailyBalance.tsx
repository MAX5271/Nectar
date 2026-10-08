import React from 'react';
import type { DietPlanDTO, DietMealDTO } from '@nectar/types';
import { NectarProgress } from '../ui/NectarProgress';
import { NectarStat } from '../ui/NectarStat';
import { NectarButton } from '../ui/NectarButton';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export interface DailyBalanceProps {
  plan: DietPlanDTO | null;
  targetCalories: number | null;
  todayAdherence: Map<string, boolean>;
  hasGeneratedToday: boolean;
  onGeneratePlan: () => void;
  isGenerating?: boolean;
}

export const DailyBalance: React.FC<DailyBalanceProps> = ({
  plan,
  targetCalories,
  todayAdherence,
  hasGeneratedToday,
  onGeneratePlan,
  isGenerating = false,
}) => {
  const meals: DietMealDTO[] = plan?.diets || [];

  // Calculate consumed totals based on adhered meals
  const consumed = meals.reduce(
    (acc, meal) => {
      const key = `${meal.mealType || meal.type || 'LUNCH'}|${meal.meal}`;
      if (todayAdherence.get(key)) {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.carbs += meal.carb || 0;
        acc.fat += meal.fat || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const plannedCalories = plan?.totalCalories || targetCalories || 2000;
  const targetCal = targetCalories || plannedCalories;
  const remainingCalories = Math.max(0, targetCal - consumed.calories);

  const totalProtein = plan?.totalProtein || 140;
  const totalCarbs = plan?.totalCarbs || 220;
  const totalFat = plan?.totalFat || 65;

  return (
    <div className="rounded-3xl border border-line bg-bone-light/90 p-6 shadow-warm-sm space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Daily Balance
        </span>
        <span className="text-xs font-mono text-ink-muted">
          {plan ? `${meals.length} meals planned` : 'No plan active'}
        </span>
      </div>

      {/* Calorie Centerpiece */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <NectarStat
            label="Consumed / Target"
            value={consumed.calories.toLocaleString()}
            unit={`of ${targetCal.toLocaleString()} kcal`}
            size="lg"
          />
          <div className="text-right">
            <span className="text-[11px] font-mono uppercase text-ink-muted block">Remaining</span>
            <span className="font-mono text-lg font-medium text-honey-dark">
              {remainingCalories.toLocaleString()} <span className="text-xs text-ink-muted">kcal</span>
            </span>
          </div>
        </div>

        <div className="mt-3">
          <NectarProgress
            value={consumed.calories}
            max={targetCal}
            variant="calorie"
            size="md"
          />
        </div>
      </div>

      {/* Macro Breakdown Bars */}
      <div className="space-y-4 pt-2 border-t border-line/50">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted block">
          Macro Targets
        </span>

        {/* Protein */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-beet font-semibold">Protein</span>
            <span className="text-ink">
              {consumed.protein}g <span className="text-ink-muted">/ {totalProtein}g</span>
            </span>
          </div>
          <NectarProgress
            value={consumed.protein}
            max={totalProtein}
            variant="protein"
            size="sm"
          />
        </div>

        {/* Carbs */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-turmeric-dark font-semibold">Carbs</span>
            <span className="text-ink">
              {consumed.carbs}g <span className="text-ink-muted">/ {totalCarbs}g</span>
            </span>
          </div>
          <NectarProgress
            value={consumed.carbs}
            max={totalCarbs}
            variant="carb"
            size="sm"
          />
        </div>

        {/* Fat */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-herb font-semibold">Fat</span>
            <span className="text-ink">
              {consumed.fat}g <span className="text-ink-muted">/ {totalFat}g</span>
            </span>
          </div>
          <NectarProgress
            value={consumed.fat}
            max={totalFat}
            variant="fat"
            size="sm"
          />
        </div>
      </div>

      {/* Daily Plan Trigger */}
      <div className="pt-2 border-t border-line/50">
        {hasGeneratedToday ? (
          <div className="flex items-center gap-2 text-xs font-sans text-herb">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Plan active for today</span>
          </div>
        ) : (
          <NectarButton
            variant="primary"
            size="md"
            loading={isGenerating}
            onClick={onGeneratePlan}
            className="w-full"
            leftIcon={<Sparkles className="h-4 w-4 text-honey" />}
          >
            {isGenerating ? 'Synthesizing...' : "Synthesize Today's Plan"}
          </NectarButton>
        )}
      </div>
    </div>
  );
};
