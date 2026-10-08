import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { syncSupabaseSession } from '../../services/authFlow';
import { notify } from '../../lib/toast';
import Loader from '../../components/Loader';

// Supabase redirects here after a user confirms their email or completes OAuth.
const AuthCallback: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useSmartNavigate();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const { supabase } = await import('../../services/supabaseClient');
        if (!supabase) {
          if (isMounted) navigate('/login');
          return;
        }

        // 1. Check if session is already parsed
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session?.access_token) {
          // If hash hasn't finished parsing, listen to onAuthStateChange
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.access_token) {
                authListener.subscription.unsubscribe();
                try {
                  await syncSupabaseSession(dispatch, session.access_token);
                  notify.success('Email confirmed — welcome to Nectar!');
                  navigate('/dashboard');
                } catch {
                  notify.error('Could not activate your session.');
                  navigate('/login');
                }
              }
            },
          );

          // Grace period fallback
          setTimeout(() => {
            if (isMounted) {
              authListener.subscription.unsubscribe();
              navigate('/login');
            }
          }, 4000);
          return;
        }

        // Session was available immediately
        await syncSupabaseSession(dispatch, data.session.access_token);
        notify.success('Email confirmed — welcome to Nectar!');
        navigate('/dashboard');
      } catch (err: any) {
        notify.error(err?.message || 'Could not verify confirmation link.');
        if (isMounted) navigate('/login');
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-linen">
      <Loader />
    </div>
  );
};

export default AuthCallback;
