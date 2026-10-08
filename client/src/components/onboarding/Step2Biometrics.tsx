import React from 'react';
import { type NectarPayload } from '../../types';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface StepProps {
  payload: NectarPayload;
  updatePayload: (data: Partial<NectarPayload>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step2Biometrics: React.FC<StepProps> = ({ payload, updatePayload, nextStep, prevStep }) => {
  const handleContinue = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.age || !payload.gender || !payload.height || !payload.weight || !payload.unitSystem) return;
    nextStep();
  };

  return (
    <form onSubmit={handleContinue} className="flex flex-col gap-5">
      <div className="mb-1">
        <h2 className="font-display text-xl font-semibold text-ink">About you</h2>
        <p className="mt-1 text-sm text-ink-soft">This helps us work out your daily calorie target.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Units">
          <Select
            required
            value={payload.unitSystem}
            onChange={(e) => updatePayload({ unitSystem: e.target.value as NectarPayload['unitSystem'] })}
          >
            <option value="" disabled>Choose one</option>
            <option value="METRIC">Metric (kg / cm)</option>
            <option value="IMPERIAL">Imperial (lb / in)</option>
          </Select>
        </Field>

        <Field label="Gender">
          <Select
            required
            value={payload.gender}
            onChange={(e) => updatePayload({ gender: e.target.value as NectarPayload['gender'] })}
          >
            <option value="" disabled>Choose one</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Age">
          <Input type="number" required value={payload.age} onChange={(e) => updatePayload({ age: e.target.value })} />
        </Field>
        <Field label="Height">
          <Input type="number" step="0.1" required value={payload.height} onChange={(e) => updatePayload({ height: e.target.value })} />
        </Field>
        <Field label="Weight">
          <Input type="number" step="0.1" required value={payload.weight} onChange={(e) => updatePayload({ weight: e.target.value })} />
        </Field>
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" size="lg" onClick={prevStep} className="w-1/3">
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg" className="w-2/3">
          Continue
        </Button>
      </div>
    </form>
  );
};

export default Step2Biometrics;
