import React, { useState, useEffect } from 'react';
import { type NectarPayload } from '../../types';
import Step1Credentials from '../../components/onboarding/Step1Credentials';
import Step2Biometrics from '../../components/onboarding/Step2Biometrics';
import Step3Protocol from '../../components/onboarding/Step3Protocol';
import { Stepper } from '../../components/onboarding/Stepper';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { useAppDispatch } from '../../hooks/reduxHooks';
import api from '../../services/api';
import { completeAuth, signInWithGoogle } from '../../services/authFlow';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/Logo';
import { notify } from '../../lib/toast';

const STEP_LABELS = ['Account', 'About you', 'Your plan'];

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

const Register: React.FC = () => {
  const [step, setStep] = useState<number>(() => {
    const savedStep = sessionStorage.getItem('nectar_step');
    return savedStep ? parseInt(savedStep) : 1;
  });

  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepBackNotice, setStepBackNotice] = useState<string>('');

  const [payload, setPayload] = useState<NectarPayload>(() => {
    const savedData = sessionStorage.getItem('nectar_payload');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return { ...parsedData, password: '' };
    }
    return emptyPayload;
  });

  useEffect(() => {
    sessionStorage.setItem('nectar_step', step.toString());

    const safePayload = { ...payload };
    delete safePayload.password;

    sessionStorage.setItem('nectar_payload', JSON.stringify(safePayload));
  }, [step, payload]);

  const updatePayload = (data: Partial<NectarPayload>) => {
    setPayload((prev) => ({ ...prev, ...data }));
  };
  const nextStep = () => {
    setStepBackNotice('');
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setStepBackNotice('');
    setStep((prev) => prev - 1);
  };

  const submitToBackend = async () => {
    if (!payload.password && payload.authProvider !== 'google') {
      setStepBackNotice('Your session was cleared for security — please re-enter your password.');
      setStep(1);
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await api.post('/user/signup', {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        age: payload.age ? Number(payload.age) : 25,
        gender: payload.gender || 'MALE',
        height: payload.height ? Number(payload.height) : 170,
        weight: payload.weight ? Number(payload.weight) : 70,
        unitSystem: payload.unitSystem || 'METRIC',
        planType: payload.planType || 'CUTTING',
        preferences: payload.preferences || '',
      });

      if (res.data.success && res.data.data.accessToken) {
        sessionStorage.removeItem('nectar_step');
        sessionStorage.removeItem('nectar_payload');

        await completeAuth(dispatch, res.data.data.accessToken);
        notify.success('Welcome to Nectar!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      notify.error(
        err?.response?.data?.message || err?.message || "We couldn't create your account. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const user = await signInWithGoogle(dispatch);
    const hasConstraints =
      (user?.constraints && user.constraints.length > 0) || Boolean(user?.constraint);
    if (!hasConstraints) {
      notify.success("Signed in with Google — let's set up your profile!");
      navigate('/welcome');
    } else {
      notify.success('Welcome back to Nectar!');
      navigate('/dashboard');
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
            <Step1Credentials
              payload={payload}
              updatePayload={updatePayload}
              nextStep={nextStep}
              notice={stepBackNotice}
              onGoogleSignUp={handleGoogleSignUp}
            />
          )}
          {step === 2 && (
            <Step2Biometrics
              payload={payload}
              updatePayload={updatePayload}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 3 && (
            <Step3Protocol
              payload={payload}
              isSubmitting={isSubmitting}
              updatePayload={updatePayload}
              prevStep={prevStep}
              submitToBackend={submitToBackend}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Register;
