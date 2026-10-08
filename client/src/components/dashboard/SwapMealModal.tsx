import React, { useState } from 'react';
import api from '../../services/api';
import axios from 'axios';
import type { DietMealDTO, DietPlanDTO } from '@nectar/types';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { notify } from '../../lib/toast';

interface SwapMealModalProps {
  meal: DietMealDTO;
  isOpen: boolean;
  onClose: () => void;
  onMealSwapped: (swappedMeal: DietMealDTO, updatedPlan: DietPlanDTO) => void;
}

const PRESET_REASONS = [
  "Don't like this food",
  "Missing ingredients",
  "Want a vegetarian alternative",
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

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSwapping(true);

    const finalReason = customReason.trim() || selectedReason;

    try {
      const response = await api.post('/diet/swap', {
        dietId: meal.id,
        reason: finalReason,
      });

      if (response.data.success && response.data.data) {
        onMealSwapped(response.data.data.meal, response.data.data.plan);
        notify.success('Meal swapped.');
        onClose();
      }
    } catch (err) {
      notify.error(
        axios.isAxiosError(err) ? err.response?.data?.message || "Couldn't swap that meal." : "Couldn't swap that meal.",
      );
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()} title={`Swap ${meal.type || meal.mealType}`}>
      <Card variant="flat" padding="sm" className="mb-4">
        <p className="text-xs font-medium uppercase text-ink-soft">Current meal</p>
        <p className="mt-1 text-sm font-semibold text-ink">{meal.meal}</p>
        <p className="mt-1 text-xs text-ink-soft">{meal.calories} kcal · {meal.portion}</p>
      </Card>

      <form onSubmit={handleSwap} className="flex flex-col gap-4">
        <Field label="Why swap it?">
          <Select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
            {PRESET_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </Field>

        <Field label="Anything specific? (optional)">
          <Input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="e.g. no mushrooms, want something cold"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" loading={isSwapping} className="flex-1">
            {isSwapping ? 'Swapping…' : 'Swap meal'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
