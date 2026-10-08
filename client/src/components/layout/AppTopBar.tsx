import React from 'react';
import { Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { NectarDroplet } from '../nectar/NectarDroplet';

export interface AppTopBarProps {
  onMobileMenuOpen?: () => void;
  title?: string;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onMobileMenuOpen,
  title,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const latestPlan = useAppSelector((state) => state.diet.latestPlan);

  // Formatted current date: e.g. "Wednesday, September 24"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const targetCalories = latestPlan?.totalCalories ?? 2150;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-line bg-bone-light/85 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile menu trigger + Contextual Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 -ml-2 rounded-lg text-ink-muted hover:text-ink hover:bg-bone transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
            {todayFormatted}
          </span>
          <span className="font-display text-base sm:text-lg font-medium tracking-tight text-ink leading-tight">
            {title ?? ((user?.name || user?.username) ? `Welcome back, ${user?.name || user?.username}` : "Today's Protocol")}
          </span>
        </div>
      </div>

      {/* Right: Instrumentation Indicators */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Daily Streak Indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-honey-subtle/70 border border-honey/25 text-xs font-mono font-medium text-honey-dark"
          title="Daily adherence streak"
        >
          <NectarDroplet state="filled" color="honey" size="xs" />
          <span>3d streak</span>
        </div>

        {/* Daily Target Calories Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-bone border border-line text-xs font-mono text-ink">
          <span className="text-ink-muted text-[11px]">TARGET</span>
          <span className="font-medium">{targetCalories.toLocaleString()}</span>
          <span className="text-[10px] text-ink-muted">kcal</span>
        </div>

        {/* Profile Quick Link */}
        <Link
          to="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bone border border-line hover:border-beet/40 text-ink-muted hover:text-beet transition-colors"
          aria-label="Go to profile"
          title="Your System & Settings"
        >
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
};
