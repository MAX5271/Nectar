import React from 'react';
import type { DietPlanDTO } from '@nectar/types';
import { Card } from '../ui/Card';
import { MACRO_META } from '../../lib/macros';

interface DietHistoryListProps {
  history: DietPlanDTO[];
}

const formatArchiveDate = (isoString: string | Date) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/** Day-by-day list of past plans and their meals — the detail underneath Progress's charts. */
export const DietHistoryList: React.FC<DietHistoryListProps> = ({ history }) => {
  return (
    <div className="space-y-8">
      {history.map((plan) => (
        <Card key={plan.id} variant="quiet" padding="none" className="overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-line bg-bone p-4 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{formatArchiveDate(plan.date)}</h2>
            </div>

            <div className="flex gap-6 overflow-x-auto sm:gap-8">
              <div className="text-center">
                <span className="block text-[10px] font-medium uppercase text-ink-soft">Kcal</span>
                <span className="text-base font-semibold text-ink">{plan.totalCalories}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-medium uppercase text-ink-soft">Protein</span>
                <span className={`text-base font-semibold ${MACRO_META.protein.textClass}`}>{plan.totalProtein}g</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-medium uppercase text-ink-soft">Carbs</span>
                <span className={`text-base font-semibold ${MACRO_META.carbs.textClass}`}>{plan.totalCarbs}g</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-medium uppercase text-ink-soft">Fat</span>
                <span className={`text-base font-semibold ${MACRO_META.fat.textClass}`}>{plan.totalFat}g</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 p-4 sm:p-6">
            {plan.diets?.map((diet) => (
              <div key={diet.id} className="flex flex-col justify-between gap-2 rounded-md p-2.5 sm:flex-row sm:items-center hover:bg-linen/60 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-20 shrink-0 text-xs font-medium text-ink-soft">{diet.type}</span>
                  <span className="text-sm text-ink">{diet.meal}</span>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink-soft">{diet.calories} kcal</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
