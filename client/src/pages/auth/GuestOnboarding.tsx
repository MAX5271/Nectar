import React, { useState } from 'react';
import axios from 'axios';
import { type NectarPayload } from '../../types';
import Step2Biometrics from '../../components/onboarding/Step2Biometrics';
import Step3Protocol from '../../components/onboarding/Step3Protocol';
import { Stepper } from '../../components/onboarding/Stepper';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import api from '../../services/api';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { updateUser } from '../../store/slices/authSlice';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/Logo';
import { notify } from '../../lib/toast';

const STEP_LABELS = ['About you', 'Your plan'];

const emptyPayload: NectarPayload = {
  email: '',
  username: '',
  password: '',
  authProvider: 'local',
  age: '',
  gender: '',
  height: '',
  weight: '',
  unitSystem: '',
  planType: '',
  preferences: '',
};

// The last two steps of onboarding, reused as-is for a guest — they're already
// signed in (via continueAsGuest), so this only needs to collect biometrics + goal.
const GuestOnboarding: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [payload, setPayload] = useState<NectarPayload>(emptyPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();

  const updatePayload = (data: Partial<NectarPayload>) => setPayload((p) => ({ ...p, ...data }));

  const submitToBackend = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch('/user/profile', {
        age: payload.age,
        height: payload.height,
        weight: payload.weight,
        gender: payload.gender,
        unitSystem: payload.unitSystem,
        planType: payload.planType,
        preferences: payload.preferences,
      });
      dispatch(updateUser(res.data.data));
      navigate('/dashboard');
    } catch (err) {
      notify.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Couldn't save that. Try again."
          : "Couldn't save that. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-linen p-6">
      <Card variant="quiet" padding="lg" className="w-full max-w-xl sm:p-10">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex justify-center">
            <Logo iconOnly />
          </div>
          <Stepper steps={STEP_LABELS} current={step} />
        </div>

        <div>
          {step === 1 && (
            <Step2Biometrics
              payload={payload}
              updatePayload={updatePayload}
              nextStep={() => setStep(2)}
              prevStep={() => navigate('/dashboard')}
            />
          )}
          {step === 2 && (
            <Step3Protocol
              payload={payload}
              isSubmitting={isSubmitting}
              updatePayload={updatePayload}
              prevStep={() => setStep(1)}
              submitToBackend={submitToBackend}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default GuestOnboarding;
