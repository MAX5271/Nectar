import React, { useState } from 'react';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { notify } from '../../lib/toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { supabase } = await import('../../services/supabaseClient');
      if (!supabase) {
        notify.error('Password reset service is not available right now.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        notify.error(error.message);
        return;
      }

      setIsSubmitted(true);
      notify.success('Password reset email sent! Check your inbox.');
    } catch {
      notify.error('Failed to send reset link. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-linen p-4 sm:p-6">
      <Card variant="quiet" padding="lg" className="w-full max-w-md sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo iconOnly />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-honey/15 text-honey">
            {isSubmitted ? <Mail className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {isSubmitted ? 'Check your email' : 'Reset your password'}
          </h1>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <p className="text-sm leading-relaxed text-clay">
              We sent password reset instructions to <strong className="text-ink">{email}</strong>.
              Click the link in your email to choose a new password.
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-medium text-ink hover:text-beet transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-center text-sm text-clay">
              Enter the email associated with your account and we’ll send you a link to reset your password.
            </p>

            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="mt-2 w-full">
              {isLoading ? 'Sending reset link…' : 'Send reset link'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-clay hover:text-ink transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to log in
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
