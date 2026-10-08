import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import api from '../../services/api';
import { completeAuth, continueAsGuest } from '../../services/authFlow';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import axios from 'axios';
import { Logo } from '../../components/Logo';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { notify } from '../../lib/toast';

const Login: React.FC = () => {
  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setIsResending(true);
    try {
      const { supabase } = await import('../../services/supabaseClient');
      if (supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: unconfirmedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          notify.error(error.message);
        } else {
          notify.success('Confirmation email resent! Check your inbox.');
        }
      }
    } catch {
      notify.error('Could not resend email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setUnconfirmedEmail(null);

    try {
      const { supabase } = await import('../../services/supabaseClient');
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setUnconfirmedEmail(email);
            notify.error('Please verify your email before logging in.');
            return;
          }

          // Fallback check for accounts created directly in database before Supabase Auth migration
          try {
            const fallbackRes = await api.post('/auth/login', { email, password });
            if (fallbackRes.data.success && fallbackRes.data.data.accessToken) {
              await completeAuth(dispatch, fallbackRes.data.data.accessToken);
              navigate('/dashboard');
              return;
            }
          } catch {
            // ignore fallback
          }

          notify.error(error.message || 'That email or password is incorrect.');
          return;
        }

        if (data.session?.access_token) {
          const { syncSupabaseSession } = await import('../../services/authFlow');
          await syncSupabaseSession(dispatch, data.session.access_token);
          navigate('/dashboard');
          return;
        }
      }

      // Supabase unconfigured or local fallback
      const authResponse = await api.post('/auth/login', { email, password });
      if (authResponse.data.success && authResponse.data.data.accessToken) {
        await completeAuth(dispatch, authResponse.data.data.accessToken);
        navigate('/dashboard');
      }
    } catch (err) {
      notify.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'That email or password is incorrect.'
          : 'Something went wrong. Try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsGuestLoading(true);
    try {
      await continueAsGuest(dispatch);
      navigate('/welcome');
    } catch (err) {
      notify.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Couldn't start a guest session."
          : "Couldn't start a guest session.",
      );
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-linen p-4 sm:p-6">
      <Card variant="quiet" padding="lg" className="w-full max-w-md sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo iconOnly />
          <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

          <Field label="Password" htmlFor="password">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <div className="mt-1.5 text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-ink-soft hover:text-beet hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </Field>

          <div className="mt-2 flex flex-col gap-5">
            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
              {isLoading ? 'Logging in…' : 'Log in'}
            </Button>

            <p className="text-center text-sm text-ink-soft">
              New here?{' '}
              <button type="button" onClick={() => navigate('/register')} className="font-medium text-beet hover:underline">
                Create an account
              </button>
            </p>
          </div>
        </form>

        {unconfirmedEmail && (
          <div className="mt-4 rounded-xl border border-honey/40 bg-honey/10 p-4 text-center">
            <p className="text-xs text-ink leading-relaxed">
              Account activation pending for <strong>{unconfirmedEmail}</strong>.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={isResending}
              onClick={handleResendConfirmation}
              className="mt-2.5 text-xs"
            >
              Resend verification email
            </Button>
          </div>
        )}

        {isSupabaseConfigured && (
          <div className="mt-6 border-t border-line pt-6">
            <Button
              variant="secondary"
              size="lg"
              loading={isGuestLoading}
              onClick={handleGuest}
              className="w-full"
            >
              {isGuestLoading ? 'Starting…' : 'Continue as guest'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
