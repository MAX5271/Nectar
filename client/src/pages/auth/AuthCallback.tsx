import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { loginWithGoogleToken } from '../../services/authFlow';
import { notify } from '../../lib/toast';
import Loader from '../../components/Loader';

const AuthCallback: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useSmartNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription =
          urlParams.get('error_description') ||
          hashParams.get('error_description') ||
          urlParams.get('message');

        if (error || errorDescription) {
          const msg = errorDescription || error || 'Authentication was cancelled or failed.';
          if (isMounted) setErrorMessage(msg);
          notify.error(msg);
          setTimeout(() => {
            if (isMounted) navigate('/login');
          }, 2500);
          return;
        }

        const token =
          urlParams.get('credential') ||
          hashParams.get('id_token') ||
          hashParams.get('access_token') ||
          urlParams.get('code');

        if (token) {
          const user = await loginWithGoogleToken(dispatch, token);
          if (!isMounted) return;

          const hasConstraints =
            (user?.constraints && user.constraints.length > 0) || Boolean(user?.constraint);

          if (!hasConstraints) {
            notify.success("Signed in with Google — let's set up your profile!");
            navigate('/welcome');
          } else {
            notify.success('Welcome back to Nectar!');
            navigate('/dashboard');
          }
          return;
        }

        // If no token in URL, redirect back to login
        if (isMounted) navigate('/login');
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message || err?.message || 'Could not verify authentication session.';
        setErrorMessage(msg);
        notify.error(msg);
        setTimeout(() => {
          if (isMounted) navigate('/login');
        }, 2500);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-linen p-6">
      {errorMessage ? (
        <div className="text-center">
          <p className="text-sm font-medium text-tomato">{errorMessage}</p>
          <p className="mt-2 text-xs text-ink-muted">Redirecting to login…</p>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default AuthCallback;
