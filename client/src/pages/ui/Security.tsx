import React, { useEffect, useState } from 'react';
import { ShieldCheck, Smartphone, Laptop, LogOut, Sparkles } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { endSession } from '../../services/authFlow';
import { useNavigate, Link } from 'react-router-dom';
import type { SessionDTO } from '@nectar/types';
import api from '../../services/api';
import { notify } from '../../lib/toast';
import { parseUserAgent } from '../../lib/userAgent';
import { formatRelativeTime } from '../../lib/time';
import { NectarButton } from '../../components/ui/NectarButton';
import { NectarBadge } from '../../components/ui/NectarBadge';

export const Security: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAnonymous = user?.isAnonymous || !user?.email;

  const [sessions, setSessions] = useState<SessionDTO[] | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await api.get('/auth/sessions');
      if (res.data?.success && res.data?.data) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (session: SessionDTO) => {
    setRevokingId(session.id);
    try {
      await api.delete(`/auth/sessions/${session.id}`);
      setSessions((prev) => prev?.filter((s) => s.id !== session.id) ?? null);

      if (session.isCurrent) {
        notify.success('Signed out of this device.');
        await endSession(dispatch);
        navigate('/');
        return;
      }

      notify.success('Device session terminated.');
    } catch {
      notify.error("Couldn't sign out that device.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <section className="pb-4 border-b border-line">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Security & Access
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink">
          Authenticated Devices & Credential Protection
        </h1>
        <p className="mt-1.5 text-sm sm:text-base font-sans text-ink-muted max-w-2xl leading-relaxed">
          Manage signed-in devices, active sessions, and multi-surface security tokens.
        </p>
      </section>

      {/* Guest Warning */}
      {isAnonymous && (
        <div className="rounded-3xl border border-turmeric/40 bg-turmeric-subtle/70 p-6 shadow-warm-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-turmeric-dark shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg font-medium text-ink">
                  Anonymous Guest Session
                </h3>
                <p className="mt-1 text-xs font-sans text-ink-muted leading-relaxed max-w-xl">
                  You are currently using Nectar as a guest. Your plans and progress exist only on this browser. Add your email and password to secure your account and access your protocols anywhere.
                </p>
              </div>
            </div>
            <Link to="/welcome" className="shrink-0 self-start sm:self-center">
              <NectarButton variant="primary" size="md">
                Claim Account
              </NectarButton>
            </Link>
          </div>
        </div>
      )}

      {/* Active Devices & Sessions Panel */}
      <div className="rounded-3xl border border-line bg-bone-light/90 p-6 sm:p-8 shadow-warm-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-line/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-beet" />
            <h2 className="font-display text-xl font-normal text-ink">Active Sessions</h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {sessions ? `${sessions.length} active` : 'Loading...'}
          </span>
        </div>

        {isLoadingSessions ? (
          <div className="py-8 text-center text-xs font-mono text-ink-muted">
            Auditing active sessions...
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-ink-muted">
            No active session records found.
          </div>
        ) : (
          <div className="divide-y divide-line/60">
            {sessions.map((sess) => {
              const deviceLabel = parseUserAgent(sess.userAgent);
              const isMobile = Boolean(/iphone|ipad|ios|android/i.test(sess.userAgent || ''));
              const Icon = isMobile ? Smartphone : Laptop;

              return (
                <div
                  key={sess.id}
                  className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-bone border border-line text-ink-muted shadow-warm-sm">
                      <Icon className="h-5 w-5 text-ink" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-sans font-medium text-ink">
                          {deviceLabel}
                        </span>
                        {sess.isCurrent && (
                          <NectarBadge variant="fat" size="sm">
                            This device
                          </NectarBadge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs font-mono text-ink-muted">
                        <span>IP: {sess.ipAddress || 'Localhost'}</span>
                        <span>•</span>
                        <span>Active: {formatRelativeTime(sess.updatedAt || sess.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="self-start sm:self-center">
                    <NectarButton
                      variant={sess.isCurrent ? 'outline' : 'secondary'}
                      size="sm"
                      loading={revokingId === sess.id}
                      onClick={() => handleRevoke(sess)}
                      leftIcon={<LogOut className="h-3.5 w-3.5" />}
                    >
                      {sess.isCurrent ? 'Sign out' : 'Revoke'}
                    </NectarButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
