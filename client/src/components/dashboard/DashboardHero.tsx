import React from 'react';
import { motion } from 'motion/react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { NectarBadge } from '../ui/NectarBadge';

export const DashboardHero: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userConstraints = user?.constraints?.[0] || user?.constraint;
  const isMetric = userConstraints?.unitSystem !== 'IMPERIAL';

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const firstName = user?.name ? user.name.split(' ')[0] : user?.username || 'friend';
  const planType = userConstraints?.planType?.toLowerCase() || 'maintenance';
  const activityLevel = userConstraints?.activityLevel?.toLowerCase().replace('_', ' ') || 'active';

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Today's Directive
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-ink leading-[1.1]">
            {greeting}, <span className="font-serif italic">{firstName}</span>.
          </h1>
          <p className="mt-2 text-sm sm:text-base font-sans text-ink-muted max-w-xl leading-relaxed">
            Your meals are organized chronologically along your daily line. Track what you eat, swap when needed, and maintain rhythm.
          </p>
        </div>

        {/* Quick Baseline Capsule */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
          <NectarBadge variant="subtle" size="md">
            Goal: <span className="font-semibold text-beet ml-1 capitalize">{planType}</span>
          </NectarBadge>
          <NectarBadge variant="subtle" size="md">
            Pace: <span className="font-semibold text-ink ml-1 capitalize">{activityLevel}</span>
          </NectarBadge>
          {userConstraints?.weight && (
            <NectarBadge variant="subtle" size="md">
              Weight: <span className="font-semibold text-ink ml-1">{userConstraints.weight} {isMetric ? 'kg' : 'lb'}</span>
            </NectarBadge>
          )}
        </div>
      </div>
    </motion.section>
  );
};
