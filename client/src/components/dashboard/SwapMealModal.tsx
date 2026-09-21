import React, { useState } from 'react';
import api from '../../services/api';
import axios from 'axios';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';

interface SwapMealModalProps {
  meal: DietMealDTO;
  isOpen: boolean;
  onClose: () => void;
  onMealSwapped: (swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => void;
}

const PRESET_REASONS = [
  "Dislike this food",
  "Missing ingredients / Out of stock",
  "Prefer a vegetarian alternative",
  "Takes too long to prepare",
  "Craving something different",
];

export const SwapMealModal: React.FC<SwapMealModalProps> = ({
  meal,
  isOpen,
  onClose,
  onMealSwapped,
}) => {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSwapping(true);
    setError('');

    const finalReason = customReason.trim() || selectedReason;

    try {
      const response = await api.post('/diet/swap', {
        dietId: meal.id,
        reason: finalReason,
      });

      if (response.data.success && response.data.data) {
        onMealSwapped(response.data.data.meal, response.data.data.plan);
        onClose();
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to swap meal.'
          : 'Failed to swap meal.',
      );
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="border-2 border-red-600 bg-zinc-950 p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(255,0,0,0.3)]">
        <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-3 mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Swap Meal: {meal.type || meal.mealType}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xs font-mono font-bold"
          >
            [X]
          </button>
        </div>

        <div className="bg-black p-3 border border-zinc-900 mb-4">
          <p className="text-xs text-zinc-500 uppercase font-bold">Current Item</p>
          <p className="text-sm font-bold text-white mt-1">{meal.meal}</p>
          <p className="text-xs text-zinc-400 mt-1">
            {meal.calories} kcal | {meal.portion}
          </p>
        </div>

        <form onSubmit={handleSwap} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Reason for Swap
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-2 text-xs font-bold text-white focus:border-red-600 focus:outline-none"
            >
              {PRESET_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Custom Specification (Optional)
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g., No mushrooms, want cold wrap"
              className="w-full bg-black border border-zinc-800 p-2 text-xs text-white placeholder-zinc-700 focus:border-red-600 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSwapping}
              className="flex-1 py-3 bg-red-600 text-black font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-all disabled:opacity-50"
            >
              {isSwapping ? 'Regenerating...' : 'Confirm Swap'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
