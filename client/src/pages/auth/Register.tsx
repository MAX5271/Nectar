import React, { useState, useEffect } from 'react';
import { type NectarPayload } from '../../types';
import Step1Credentials from '../../components/onboarding/Step1Credentials';
import Step2Biometrics from '../../components/onboarding/Step2Biometrics';
import Step3Protocol from '../../components/onboarding/Step3Protocol';
import { Stepper } from '../../components/onboarding/Stepper';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { syncSupabaseSession } from '../../services/authFlow';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/Logo';
import { notify } from '../../lib/toast';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEP_LABELS = ['Account', 'About you', 'Your plan'];

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

  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);
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

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const { supabase } = await import('../../services/supabaseClient');
      if (!supabase) {
        notify.error('Supabase authentication is not configured.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: payload.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        notify.error(error.message);
      } else {
        notify.success('Confirmation email resent! Check your inbox.');
      }
    } catch {
      notify.error('Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const submitToBackend = async () => {
    if (!payload.password && payload.authProvider !== 'google') {
      setStepBackNotice("Your session was cleared for security — please re-enter your password.");
      setStep(1);
      return;
    }
    setIsSubmitting(true);

    try {
      const { supabase } = await import('../../services/supabaseClient');
      if (!supabase) {
        notify.error('Authentication service is currently unavailable.');
        return;
      }

      const biometrics = {
        username: payload.username,
        age: payload.age ? Number(payload.age) : undefined,
        gender: payload.gender || undefined,
        height: payload.height ? Number(payload.height) : undefined,
        weight: payload.weight ? Number(payload.weight) : undefined,
        unitSystem: payload.unitSystem || undefined,
        planType: payload.planType || undefined,
        preferences: payload.preferences || '',
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password!,
        options: {
          data: biometrics,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        notify.error(authError.message || "We couldn't create your account. Try again.");
        return;
      }

      // Check if session was granted immediately (auto-confirm enabled)
      if (authData.session?.access_token) {
        sessionStorage.removeItem('nectar_step');
        sessionStorage.removeItem('nectar_payload');

        await syncSupabaseSession(dispatch, authData.session.access_token, biometrics);
        notify.success('Welcome to Nectar!');
        navigate('/dashboard');
      } else {
        // Confirmation email sent by Supabase
        sessionStorage.removeItem('nectar_step');
        sessionStorage.removeItem('nectar_payload');
        setIsEmailVerificationPending(true);
      }
    } catch (err: any) {
      notify.error(
        err?.response?.data?.message || err?.message || "We couldn't create your account. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailVerificationPending) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-linen p-6">
        <Card variant="quiet" padding="lg" className="w-full max-w-md text-center sm:p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-honey/15 text-honey">
              <Mail className="h-8 w-8" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">Check your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-clay">
            We sent a verification link to <strong className="text-ink">{payload.email}</strong>.
            Click the link in your email to activate your account and start your plan.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              variant="secondary"
              size="md"
              loading={isResending}
              onClick={handleResendConfirmation}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Resend verification email
            </Button>

            <Link
              to="/login"
              className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-medium text-clay hover:text-ink transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to log in
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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
            />
          )}
          {step === 2 && <Step2Biometrics payload={payload} updatePayload={updatePayload} nextStep={nextStep} prevStep={prevStep} />}
          {step === 3 && <Step3Protocol payload={payload} isSubmitting={isSubmitting} updatePayload={updatePayload} prevStep={prevStep} submitToBackend={submitToBackend} />}
        </div>
      </Card>
    </div>
  );
};

export default Register;
