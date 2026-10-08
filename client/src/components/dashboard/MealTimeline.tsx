import React from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, Sparkles } from 'lucide-react';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';
import { MealCard } from './MealCard';
import { NectarDroplet } from '../nectar/NectarDroplet';
import { NectarButton } from '../ui/NectarButton';

export interface MealTimelineProps {
  plan: DietPlanDTO | null;
  todayAdherence: Map<string, boolean>;
  onMealSwapped: (swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => void;
  onAdherenceLogged?: () => void;
  onGeneratePlan: () => void;
  isGenerating?: boolean;
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } },
};

// Helper for chronological time hints
const getTimeSlot = (mealType?: string, index: number = 0): string => {
  const type = (mealType || '').toUpperCase();
  if (type.includes('BREAKFAST')) return '08:00 AM';
  if (type.includes('LUNCH')) return '01:00 PM';
  if (type.includes('SNACK')) return '04:30 PM';
  if (type.includes('DINNER')) return '07:45 PM';

  const defaultTimes = ['08:30 AM', '12:45 PM', '04:15 PM', '07:30 PM'];
  return defaultTimes[index] || `Meal ${index + 1}`;
};

export const MealTimeline: React.FC<MealTimelineProps> = ({
  plan,
  todayAdherence,
  onMealSwapped,
  onAdherenceLogged,
  onGeneratePlan,
  isGenerating = false,
}) => {
  const meals = plan?.diets || [];

  if (!plan || meals.length === 0) {
    return (
      <div className="relative rounded-3xl border border-line bg-bone-light/90 p-8 sm:p-12 text-center shadow-warm-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bone border border-line text-ink-muted">
          <UtensilsCrossed className="h-6 w-6 text-honey" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-normal text-ink">
          No food plan generated for today
        </h3>
        <p className="mt-2 text-sm font-sans text-ink-muted max-w-md mx-auto leading-relaxed">
          Nectar synthesizes your target macros into balanced, chef-crafted recipes tailored to your body and preferences.
        </p>
        <div className="mt-6 flex justify-center">
          <NectarButton
            variant="primary"
            size="lg"
            loading={isGenerating}
            onClick={onGeneratePlan}
            leftIcon={<Sparkles className="h-4 w-4 text-honey" />}
          >
            Synthesize Today's Plan
          </NectarButton>
        </div>
      </div>
    );
  }

  // Count eaten
  const eatenCount = meals.filter((m) => {
    const key = `${m.mealType || m.type || 'LUNCH'}|${m.meal}`;
    return todayAdherence.get(key);
  }).length;

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-honey" />
          <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-ink">
            Chronological Protocol
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <span className="font-medium text-ink">{eatenCount} of {meals.length}</span> logged
        </div>
      </div>

      {/* Timeline container */}
      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="relative space-y-6 sm:space-y-8"
      >
        {meals.map((meal, index) => {
          const mealType = meal.mealType || meal.type || 'LUNCH';
          const adherenceKey = `${mealType}|${meal.meal}`;
          const isAdhered = Boolean(todayAdherence.get(adherenceKey));
          const timeSlot = getTimeSlot(mealType, index);
          const isLast = index === meals.length - 1;

          return (
            <motion.div key={meal.id || index} variants={listItem} className="relative flex gap-4 sm:gap-6">
              {/* Left: The Physical Nectar Line Rail & Node */}
              <div className="relative flex flex-col items-center shrink-0 w-8 sm:w-10">
                {/* Node: Nectar Droplet */}
                <div
                  className="z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-bone-light border border-line shadow-warm-sm transition-transform duration-300"
                  title={`${meal.meal} (${isAdhered ? 'Completed' : 'Pending'})`}
                >
                  <NectarDroplet
                    state={isAdhered ? 'filled' : 'hollow'}
                    color={isAdhered ? 'herb' : 'honey'}
                    size="xs"
                  />
                </div>

                {/* Connecting Nectar Line */}
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-line my-1 min-h-[4rem]" aria-hidden="true" />
                )}
              </div>

              {/* Right: Protagonist Meal Card */}
              <div className="flex-1 min-w-0">
                <MealCard
                  meal={meal}
                  timeSlot={timeSlot}
                  initialAdhered={isAdhered}
                  onMealSwapped={onMealSwapped}
                  onAdherenceLogged={onAdherenceLogged}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
