import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import api from '../../services/api';
import { completeAuth, signInWithGoogle } from '../../services/authFlow';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import axios from 'axios';
import { Logo } from '../../components/Logo';
import { GoogleIcon } from '../../components/icons/GoogleIcon';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { notify } from '../../lib/toast';

const Login: React.FC = () => {
  const navigate = useSmartNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
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
    } catch (err: any) {
      notify.error(err?.message || 'Could not initiate Google sign in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-linen p-4 sm:p-6">
      <Card variant="quiet" padding="lg" className="w-full max-w-md sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo iconOnly />
          <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            loading={isGoogleLoading}
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 border-line bg-linen/50 hover:bg-cream"
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative bg-bone px-3 text-xs uppercase tracking-wider text-ink-muted">
              or continue with email
            </span>
          </div>
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
      </Card>
    </div>
  );
};

export default Login;
