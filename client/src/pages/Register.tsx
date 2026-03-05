import React, { useState, useEffect } from 'react';
import { type NectarPayload } from '../types';
import Step1Credentials from '../components/onboarding/Step1Credentials';
import Step2Biometrics from '../components/onboarding/Step2Biometrics';
import Step3Protocol from '../components/onboarding/Step3Protocol';

const emptyPayload: NectarPayload = {
  email: '', username: '', password: '', authProvider: 'local', 
  age: '', gender: '', height: '', weight: '', unitSystem: '', 
  planType: '', preferences: '',
};

const Register: React.FC = () => {
  const [step, setStep] = useState<number>(() => {
    const savedStep = sessionStorage.getItem('nectar_step');
    return savedStep ? parseInt(savedStep) : 1;
  });

  //optimization technique know as lazy initialization. Tied to the life cycle of a browser's tab and not permanent like local storage.
  const [payload, setPayload] = useState<NectarPayload>(() => {
    const savedData = sessionStorage.getItem('nectar_payload');
    if (savedData) {
        //until we parse the saveData using json.parse, the saveData string means nothing.
      const parsedData = JSON.parse(savedData);
      return { ...parsedData, password: '' };
    }
    return emptyPayload;
  });

  useEffect(() => {
    // this is non-volatile storage that stays for a particular session.
    sessionStorage.setItem('nectar_step', step.toString());
    
    //edit safePayload and use it finally to upload data.
    const safePayload = { ...payload };
    
    //delete keyword destroys this property of the object.
    //we delete the password as a security meassure as we store the payload and if we delete the password it will never leave the volatile memory of the browser
    delete safePayload.password;
    
    sessionStorage.setItem('nectar_payload', JSON.stringify(safePayload));
  }, [step, payload]);

  //the partial keyword here tells that the data may contain pieces of the NectarPayload and not the whole payload.
  //passing the function instead of directly setting makes it update on the very millisecond. If we do not do that, react will club several keystrokes.
  const updatePayload = (data: Partial<NectarPayload>) => setPayload((prev) => ({ ...prev, ...data }));
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const submitToBackend = async () => {
    if (!payload.password && payload.authProvider !== 'google') {
      alert("System security protocol: Session memory wiped. Please re-verify your access code.");
      setStep(1);
      return;
    }

    console.log('[SYSTEM] Executing payload sequence:', payload);
    
    try {
      
      sessionStorage.removeItem('nectar_step');
      sessionStorage.removeItem('nectar_payload');
      alert("System initialized successfully.");
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-zinc-950 p-6 font-sans text-white">
      <div className="w-full max-w-xl border-4 border-red-600 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] sm:p-12">
        
        <div className="mb-8 border-b-4 border-zinc-800 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">System Setup</h1>
            <span className="bg-red-600 px-3 py-1 text-xs font-black text-black">PHASE 0{step} / 03</span>
          </div>
          <div className="h-2 w-full bg-zinc-900">
            <div className="h-full bg-red-600 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <div className="min-h-[350px]">
          {step === 1 && <Step1Credentials payload={payload} updatePayload={updatePayload} nextStep={nextStep} />}
          {step === 2 && <Step2Biometrics payload={payload} updatePayload={updatePayload} nextStep={nextStep} prevStep={prevStep} />}
          {step === 3 && <Step3Protocol payload={payload} updatePayload={updatePayload} prevStep={prevStep} submitToBackend={submitToBackend} />}
        </div>

      </div>
    </div>
  );
};

export default Register;

/**NOTE ON LAZY INITIALIZATION
 *  Lazy loading is passing the function in the useState hook.
 * If we directly pass data, every single key stroke forces re-render and reinitialization but lazy method make it only initialize once.
 */