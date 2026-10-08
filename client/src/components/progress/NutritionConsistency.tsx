import React from 'react';
import { Target } from 'lucide-react';
import { NectarProgress } from '../ui/NectarProgress';
import { NectarStat } from '../ui/NectarStat';

export const NutritionConsistency: React.FC = () => {
  return (
    <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-line/60">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-ink-muted" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
            Target Precision
          </span>
        </div>
        <span className="text-xs font-mono text-herb font-medium">92% Precision</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <NectarStat label="Protein Accuracy" value="95%" size="md" />
          <p className="mt-1 text-xs font-sans text-ink-muted leading-relaxed">
            Within ±8g of daily target across last 14 logged days.
          </p>
          <div className="mt-3">
            <NectarProgress value={95} max={100} variant="protein" size="sm" />
          </div>
        </div>

        <div>
          <NectarStat label="Calorie Target" value="91%" size="md" />
          <p className="mt-1 text-xs font-sans text-ink-muted leading-relaxed">
            Averaging 2,120 kcal vs 2,150 target (1.4% variance).
          </p>
          <div className="mt-3">
            <NectarProgress value={91} max={100} variant="calorie" size="sm" />
          </div>
        </div>

        <div>
          <NectarStat label="Hydration & Fiber" value="88%" size="md" />
          <p className="mt-1 text-xs font-sans text-ink-muted leading-relaxed">
            Fiber intake steady at 34g average per day.
          </p>
          <div className="mt-3">
            <NectarProgress value={88} max={100} variant="fat" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
