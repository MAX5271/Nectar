import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { NectarButton } from '../ui/NectarButton';

export const GuestClaim: React.FC = () => {
  return (
    <div className="rounded-3xl border border-turmeric/40 bg-turmeric-subtle/60 p-5 shadow-warm-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-bone-light border border-turmeric/30 text-turmeric-dark shadow-warm-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-base font-medium text-ink">
              Guest Session Active
            </h4>
            <p className="mt-0.5 text-xs font-sans text-ink-muted leading-relaxed">
              Your diet plan and progress are stored temporarily on this browser. Add your email and password to secure your data and access it from any device.
            </p>
          </div>
        </div>

        <Link to="/welcome" className="shrink-0 self-start sm:self-center">
          <NectarButton
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Claim Account
          </NectarButton>
        </Link>
      </div>
    </div>
  );
};
