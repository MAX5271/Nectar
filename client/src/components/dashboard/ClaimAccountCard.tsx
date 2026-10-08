import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { notify } from '../../lib/toast';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

/** Shown on Dashboard for guest accounts (no email yet) — lets them claim it via Supabase's email verification. */
export function ClaimAccountCard() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email },
        { emailRedirectTo: `${window.location.origin}/auth/callback` },
      );
      if (error) throw error;
      setIsSent(true);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Couldn't send that. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <Card variant="accent" padding="md">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-beet" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-ink">Check your inbox</h2>
            <p className="mt-1 text-sm text-ink-soft">
              We sent a confirmation link to {email}. Click it to save your account.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="accent" padding="md">
      <h2 className="text-sm font-semibold text-ink">Add an email to keep your data</h2>
      <p className="mt-1 text-sm text-ink-soft">
        You're using Nectar as a guest. If you switch devices or clear your browser, this can't be recovered —
        add an email so it's safe.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Email" className="flex-1">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Button type="submit" variant="primary" loading={isSubmitting} className="sm:w-auto">
          Save account
        </Button>
      </form>
    </Card>
  );
}
