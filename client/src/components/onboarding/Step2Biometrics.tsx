import React from 'react';
import { type NectarPayload } from '../../types';

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
    <form onSubmit={handleContinue} className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="mb-4 border-l-4 border-red-600 pl-4">
        <h2 className="text-lg font-black uppercase tracking-widest text-white">Biometric Calibration</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Input base physical metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Unit System</label>
          <select 
            required value={payload.unitSystem}
            onChange={(e) => updatePayload({ unitSystem: e.target.value as NectarPayload['unitSystem'] })}
            className="appearance-none border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          >
            <option value="" disabled>SELECT UNIT</option>
            <option value="METRIC">Metric (kg/cm)</option>
            <option value="IMPERIAL">Imperial (lbs/in)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Gender</label>
          <select 
            required value={payload.gender}
            onChange={(e) => updatePayload({ gender: e.target.value as NectarPayload['gender'] })}
            className="appearance-none border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          >
            <option value="" disabled>SELECT GENDER</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Age</label>
          <input 
            type="number" required value={payload.age}
            onChange={(e) => updatePayload({ age: e.target.value })}
            className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Height</label>
          <input 
            type="number" step="0.1" required value={payload.height}
            onChange={(e) => updatePayload({ height: e.target.value })}
            className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Weight</label>
          <input 
            type="number" step="0.1" required value={payload.weight}
            onChange={(e) => updatePayload({ weight: e.target.value })}
            className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <button type="button" onClick={prevStep} className="w-1/3 border-2 border-zinc-800 bg-black px-4 py-4 text-sm font-black uppercase tracking-widest text-zinc-500 transition-colors hover:border-white hover:text-white">
          Back
        </button>
        <button type="submit" className="w-2/3 transform bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none">
          Set Protocol
        </button>
      </div>
    </form>
  );
};

export default Step2Biometrics;