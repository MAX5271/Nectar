import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { PlanExplanationDTO } from '@nectar/types';

export const PlanExplanationCard: React.FC = () => {
  const [explanation, setExplanation] = useState<PlanExplanationDTO | null>(null);
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
      }
    };
    fetchExplanation();
  }, []);

  if (!explanation) return null;

  return (
    <div className="border-2 border-zinc-800 bg-black p-6">
      <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-2 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Metabolic Formula & Target
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest"
        >
          [{isOpen ? 'Collapse' : 'Explain Math'}]
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-3">
        <div className="bg-zinc-950 p-2.5 border border-zinc-900">
          <span className="block text-[9px] text-zinc-600 uppercase font-bold">Base BMR</span>
          <span className="text-sm font-bold text-white">{explanation.bmr} kcal</span>
        </div>
        <div className="bg-zinc-950 p-2.5 border border-zinc-900">
          <span className="block text-[9px] text-zinc-600 uppercase font-bold">Activity TDEE</span>
          <span className="text-sm font-bold text-blue-400">{explanation.tdee} kcal</span>
        </div>
        <div className="bg-zinc-950 p-2.5 border border-zinc-900">
          <span className="block text-[9px] text-zinc-600 uppercase font-bold">Target Intake</span>
          <span className="text-sm font-bold text-red-500">{explanation.targetCalories} kcal</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-zinc-900 font-mono text-xs space-y-2 text-zinc-400">
          <div className="flex justify-between">
            <span>Activity Multiplier ({explanation.activityLevel}):</span>
            <span className="text-white">x{explanation.activityMultiplier}</span>
          </div>
          <div className="flex justify-between">
            <span>Goal Adjustment ({explanation.goal}):</span>
            <span className={explanation.goalAdjustment < 0 ? 'text-red-400' : 'text-green-400'}>
              {explanation.goalAdjustment > 0 ? '+' : ''}{explanation.goalAdjustment} kcal
            </span>
          </div>
          {explanation.safetyFloorApplied && (
            <p className="text-[10px] text-yellow-500 font-bold uppercase mt-2">
              * Safety floor applied (1200 kcal floor enforced).
            </p>
          )}

          <div className="pt-2 border-t border-zinc-900">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Macro Energy Split
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-zinc-950 p-2 border border-blue-950 text-blue-400">
                <span className="block font-bold">PROTEIN</span>
                <span>{explanation.macroSplit.proteinGrams}g ({explanation.macroSplit.proteinPct}%)</span>
              </div>
              <div className="bg-zinc-950 p-2 border border-yellow-950 text-yellow-400">
                <span className="block font-bold">CARBS</span>
                <span>{explanation.macroSplit.carbsGrams}g ({explanation.macroSplit.carbsPct}%)</span>
              </div>
              <div className="bg-zinc-950 p-2 border border-orange-950 text-orange-400">
                <span className="block font-bold">FAT</span>
                <span>{explanation.macroSplit.fatGrams}g ({explanation.macroSplit.fatPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
