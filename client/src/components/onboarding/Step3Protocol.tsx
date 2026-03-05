import React from 'react';
import { type NectarPayload } from '../../types';

interface StepProps {
  payload: NectarPayload;
  updatePayload: (data: Partial<NectarPayload>) => void;
  prevStep: () => void;
  submitToBackend: () => void;
}

const Step3Protocol: React.FC<StepProps> = ({ payload, updatePayload, prevStep, submitToBackend }) => {
  const handleFinalSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.planType) return;
    submitToBackend();
  };

  return (
    <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="mb-4 border-l-4 border-red-600 pl-4">
        <h2 className="text-lg font-black uppercase tracking-widest text-white">System Protocol</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Define operational targets</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Primary Objective</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['CUTTING', 'BULKING', 'RECOMP'].map((type) => (
            <button
              key={type} type="button"
              onClick={() => updatePayload({ planType: type as NectarPayload['planType'] })}
              className={`border-2 px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors ${
                payload.planType === type 
                  ? 'border-red-600 bg-red-600 text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]' 
                  : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dietary Preferences (Optional)</label>
        <input 
          type="text" value={payload.preferences}
          onChange={(e) => updatePayload({ preferences: e.target.value })}
          className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-700 outline-none transition-colors focus:border-red-600"
          placeholder="E.g., High Protein, Vegan, No Nuts"
        />
      </div>

      <div className="mt-8 border-t-2 border-zinc-800 pt-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          WARNING: Executing this protocol will lock in your initial baseline and trigger the AI generation matrix.
        </p>
        <div className="flex gap-4">
          <button type="button" onClick={prevStep} className="w-1/3 border-2 border-zinc-800 bg-black px-4 py-4 text-sm font-black uppercase tracking-widest text-zinc-500 transition-colors hover:border-white hover:text-white">
            Back
          </button>
          <button type="submit" className="w-2/3 transform bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:bg-zinc-200 hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] active:translate-y-0 active:shadow-none">
            Execute Initialization
          </button>
        </div>
      </div>
    </form>
  );
};

export default Step3Protocol;