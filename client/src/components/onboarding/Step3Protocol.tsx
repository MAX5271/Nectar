import React from 'react';
import { type NectarPayload } from '../../types';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SegmentedControl, type SegmentedOption } from '../ui/SegmentedControl';

interface StepProps {
  payload: NectarPayload;
  updatePayload: (data: Partial<NectarPayload>) => void;
  prevStep: () => void;
  submitToBackend: () => void;
  isSubmitting: boolean;
}

const PLAN_OPTIONS: SegmentedOption<NonNullable<NectarPayload['planType']>>[] = [
  { value: 'CUTTING', label: 'Cutting', description: 'Lose fat' },
  { value: 'BULKING', label: 'Bulking', description: 'Build mass' },
  { value: 'RECOMP', label: 'Recomp', description: 'Both at once' },
];

const Step3Protocol: React.FC<StepProps> = ({ payload, updatePayload, prevStep, submitToBackend, isSubmitting }) => {
  const handleFinalSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.planType) return;
    submitToBackend();
  };

  return (
    <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
      <div className="mb-1">
        <h2 className="font-display text-xl font-semibold text-ink">Your plan</h2>
        <p className="mt-1 text-sm text-ink-soft">What are you working toward?</p>
      </div>

      <Field label="Goal">
        <SegmentedControl
          name="Goal"
          options={PLAN_OPTIONS}
          value={payload.planType || 'CUTTING'}
          onChange={(value) => updatePayload({ planType: value })}
        />
      </Field>

      <Field label="Food preferences (optional)">
        <Input
          type="text"
          value={payload.preferences}
          onChange={(e) => updatePayload({ preferences: e.target.value })}
          placeholder="e.g. high protein, vegetarian, no nuts"
        />
      </Field>

      <div className="mt-4 border-t border-line pt-5">
        <p className="mb-4 text-sm text-ink-soft">
          We'll use this to build your first day of meals as soon as you finish.
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={prevStep} className="w-1/3">
            Back
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-2/3">
            {isSubmitting ? 'Building your plan…' : 'Build my plan'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Step3Protocol;
