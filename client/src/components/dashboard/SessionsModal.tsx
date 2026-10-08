import { useEffect, useState } from 'react';
import type { SessionDTO } from '@nectar/types';
import api from '../../services/api';
import { notify } from '../../lib/toast';
import { parseUserAgent } from '../../lib/userAgent';
import { formatRelativeTime } from '../../lib/time';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { endSession } from '../../services/authFlow';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionsModal({ isOpen, onClose }: SessionsModalProps) {
  const [sessions, setSessions] = useState<SessionDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useSmartNavigate();

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setIsLoading(true);
    api
      .get('/auth/sessions')
      .then((res) => {
        if (active && res.data.success) setSessions(res.data.data);
      })
      .catch((err) => {
        console.error('Failed to load sessions', err);
        notify.error("Couldn't load your devices.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleRevoke = async (session: SessionDTO) => {
    setRevokingId(session.id);
    try {
      await api.delete(`/auth/sessions/${session.id}`);
      setSessions((prev) => prev?.filter((s) => s.id !== session.id) ?? null);

      if (session.isCurrent) {
        notify.success("You've been signed out of this device.");
        onClose();
        await endSession(dispatch);
        navigate('/login');
        return;
      }

      notify.success('Device signed out.');
    } catch (err) {
      console.error('Failed to revoke session', err);
      notify.error("Couldn't sign out that device.");
    } finally {
      setRevokingId(null);
      setConfirmingId(null);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Devices"
      description="Everywhere you're currently signed in."
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <p className="text-sm text-ink-soft">No active sessions found.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-md border border-line bg-linen p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{parseUserAgent(session.userAgent)}</span>
                {session.isCurrent && <Badge tone="herb">This device</Badge>}
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Active {formatRelativeTime(session.updatedAt)}
                {session.ipAddress ? ` · ${session.ipAddress}` : ''}
              </p>

              {confirmingId === session.id ? (
                <div className="mt-3 flex flex-col gap-2 rounded-md bg-tomato/5 p-2.5 text-xs text-tomato">
                  <p>
                    {session.isCurrent
                      ? 'This is your current device — signing it out will end this session too.'
                      : 'Sign out this device?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      loading={revokingId === session.id}
                      onClick={() => handleRevoke(session)}
                    >
                      Yes, sign out
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmingId(session.id)}>
                    Sign out
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
