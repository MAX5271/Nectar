import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { type NectarPayload } from '../../types';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

interface StepProps {
  payload: NectarPayload;
  updatePayload: (data: Partial<NectarPayload>) => void;
  nextStep: () => void;
  notice?: string;
}

const Step1Credentials: React.FC<StepProps> = ({ payload, updatePayload, nextStep, notice }) => {
  const navigate = useSmartNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleContinue = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payload.email || !payload.username || (!payload.password && payload.authProvider === 'local')) return;

    if (payload.authProvider === 'local' && payload.password !== confirmPassword) {
      setConfirmError("Passwords don't match.");
      return;
    }

    setConfirmError('');
    nextStep();
  };

  return (
    <>
      <form onSubmit={handleContinue} className="flex flex-col gap-5">
        <div className="mb-1">
          <h2 className="font-display text-xl font-semibold text-ink">Create your account</h2>
          <p className="mt-1 text-sm text-ink-soft">Let's start with the basics.</p>
        </div>

        {notice && (
          <p role="alert" className="rounded-md border border-tomato/30 bg-tomato/5 px-4 py-3 text-sm text-tomato">
            {notice}
          </p>
        )}

        <Field label="Username">
          <Input
            type="text"
            required
            value={payload.username}
            onChange={(e) => updatePayload({ username: e.target.value })}
            placeholder="How should we call you?"
          />
        </Field>

        <Field label="Email">
          <Input
            type="email"
            required
            value={payload.email}
            onChange={(e) => updatePayload({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              value={payload.password}
              onChange={(e) => updatePayload({ password: e.target.value })}
              placeholder="Create a password"
              className="pr-11"
            />
            <IconButton
              type="button"
              label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          </div>
        </Field>

        <Field label="Confirm password" error={confirmError}>
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError('');
            }}
            placeholder="Type it again"
          />
        </Field>

        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full">
          Continue
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-medium text-beet hover:underline">
          Log in
        </button>
      </p>
    </>
  );
};

export default Step1Credentials;
