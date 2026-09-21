import { useState } from 'react';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';
import { SwapMealModal } from './SwapMealModal';
import api from '../../services/api';

interface MealCardProps {
  meal: DietMealDTO;
  onMealSwapped: (swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => void;
  onAdherenceLogged?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onMealSwapped,
  onAdherenceLogged,
}) => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isAdhered, setIsAdhered] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleToggleAdherence = async () => {
    setIsLogging(true);
    try {
      const nextState = !isAdhered;
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
    } catch (err) {
      console.error('Failed to log adherence', err);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <>
      <div className={`border-2 bg-black p-5 transition-all ${isAdhered ? 'border-green-600/70 bg-zinc-950/60' : 'border-zinc-800 hover:border-zinc-700'}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block bg-zinc-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-zinc-800">
                {meal.type || meal.mealType}
              </span>
              {isAdhered && (
                <span className="inline-block bg-green-950/60 text-green-400 border border-green-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                  Logged / Consumed
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{meal.meal}</h3>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              <span className="text-zinc-600 font-bold uppercase text-xs">Portion:</span> {meal.portion}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end md:items-center gap-4">
            <div className="grid grid-cols-4 gap-3 bg-zinc-950 p-3 border border-zinc-900 shrink-0 text-center">
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Cal</span>
                <span className="font-bold text-red-500 text-sm">{meal.calories}</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Pro</span>
                <span className="font-bold text-sm">{meal.protein}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Carb</span>
                <span className="font-bold text-sm">{meal.carb}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-zinc-600 uppercase font-bold">Fat</span>
                <span className="font-bold text-sm">{meal.fat}g</span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handleToggleAdherence}
                disabled={isLogging}
                className={`flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isAdhered
                    ? 'bg-green-700 text-white hover:bg-green-600'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-green-600 hover:text-white'
                }`}
                title="Mark this meal as consumed"
              >
                {isLogging ? 'Logging...' : isAdhered ? '✓ Eaten' : 'Mark Eaten'}
              </button>
              <button
                onClick={() => setIsSwapModalOpen(true)}
                className="flex-1 sm:flex-none px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
              >
                ↻ Swap
              </button>
            </div>
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
