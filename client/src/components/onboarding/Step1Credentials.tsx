import React from 'react';
import { type NectarPayload } from '../../types';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

interface StepProps {
  payload: NectarPayload;
  updatePayload: (data: Partial<NectarPayload>) => void;// broadcast changes up the stream
  nextStep: () => void;
}
//: React.FC<StepProps> (TypeScript)
// Strictly defines this function as a React UI component and guarantees it only accepts the exact data wires defined in your StepProps interface.
const Step1Credentials: React.FC<StepProps> = ({ payload, updatePayload, nextStep }) => {

  const navigate = useSmartNavigate();

  const handleContinue = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.email || !payload.username || (!payload.password && payload.authProvider === 'local')) return;
    nextStep();
  };

  return (
    <>
    <form onSubmit={handleContinue} className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="mb-4 border-l-4 border-red-600 pl-4">
        <h2 className="text-lg font-black uppercase tracking-widest text-white">Identification</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Establish system credentials</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Username</label>
        <input 
          type="text" required value={payload.username}
          onChange={(e) => updatePayload({ username: e.target.value })}
          className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          placeholder="USER_ALIAS"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Secure Email</label>
        <input 
          type="email" required value={payload.email}
          onChange={(e) => updatePayload({ email: e.target.value })}
          className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          placeholder="TRANSMISSION@NODE.NET"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Access Code</label>
        <input 
          type="password" required value={payload.password || ''}
          onChange={(e) => updatePayload({ password: e.target.value })}
          className="border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition-colors focus:border-red-600"
          placeholder="••••••••"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <button type="submit" className="w-full transform bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none">
          Proceed to Biometrics
        </button>
      </div>
    </form>
    <p className=" m-4 text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
              Already a user? <a onClick={()=>navigate('/login')} className="text-red-600 transition-colors hover:text-white">Continue Here</a></p>
    </>
  );
};

export default Step1Credentials;