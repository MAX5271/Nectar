import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { NectarDroplet } from '../../components/nectar/NectarDroplet';
import { NectarButton } from '../../components/ui/NectarButton';
import { ArrowRight, Check, UtensilsCrossed, Scale, Sparkles } from 'lucide-react';

const RADIUS = 70;
const CENTER = 90;
const MACROS = [
  { label: 'Protein', share: 0.3, color: '#6e3040' },
  { label: 'Carbs', share: 0.45, color: '#d49a32' },
  { label: 'Fat', share: 0.25, color: '#52684f' },
] as const;

const MACROS_WITH_OFFSET = MACROS.reduce<Array<(typeof MACROS)[number] & { offset: number }>>(
  (acc, macro) => {
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].share : 0;
    acc.push({ ...macro, offset });
    return acc;
  },
  [],
);

const PlateChart: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-8 p-6 rounded-3xl bg-bone-light/80 border border-line shadow-warm-sm">
      <svg viewBox="0 0 180 180" className="h-40 w-40 sm:h-48 sm:w-48 shrink-0">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#ded2b8" strokeWidth="18" />
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {MACROS_WITH_OFFSET.map((macro, index) => (
            <motion.circle
              key={macro.label}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={macro.color}
              strokeWidth="18"
              style={{ pathOffset: macro.offset }}
              initial={shouldReduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: macro.share }}
              transition={{
                duration: 0.9,
                delay: shouldReduceMotion ? 0 : 0.3 + index * 0.15,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            />
          ))}
        </g>
      </svg>
      <ul className="flex flex-col gap-3 font-mono text-xs">
        {MACROS.map((macro) => (
          <li key={macro.label} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: macro.color }}
              aria-hidden="true"
            />
            <span className="text-ink font-medium">{macro.label}</span>
            <span className="text-ink-muted">{Math.round(macro.share * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  // Canonical '/' redirect: If authenticated, immediately route to Today cockpit
  if (isInitialized && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-linen text-ink">
      {/* Editorial Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-honey-subtle border border-honey/30 text-xs font-mono font-medium text-honey-dark">
              <NectarDroplet state="filled" color="honey" size="xs" />
              <span>Identity-First Personal Nutrition</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-ink leading-[1.05]">
              The food plan is the protagonist.{' '}
              <span className="font-serif italic text-beet">Everything else is instrumentation.</span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-ink-muted max-w-xl leading-relaxed">
              No endless spreadsheet entries or clinical calculators. Nectar turns your metabolic baseline into an editorial chronological journey of chef-crafted meals.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NectarButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Synthesize Your Plan
              </NectarButton>

              <NectarButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </NectarButton>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-mono text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-herb" /> Quick Google Sign-In
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-herb" /> No calorie math required
              </span>
            </div>
          </div>

          {/* Right 5 Columns: The Macro Plate Balance */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <PlateChart />
            <span className="mt-3 text-xs font-mono text-ink-muted">
              Energy Split: 30% Protein • 45% Slow Carbs • 25% Whole Fats
            </span>
          </div>
        </div>
      </section>

      {/* The Nectar Journey: 3 Principles */}
      <section className="border-t border-line bg-bone-light/70 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
              Core Principles
            </span>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight text-ink">
              Built for people who want to eat well, without obsessing over numbers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-line bg-bone shadow-warm-sm space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-bone-light border border-line text-beet shadow-warm-sm">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-normal text-ink">
                Chronological Daily Protocol
              </h3>
              <p className="text-sm font-sans text-ink-muted leading-relaxed">
                Your meals are sequenced along the Nectar Line. Wake up knowing exactly what breakfast, lunch, and dinner will look like.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-line bg-bone shadow-warm-sm space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-bone-light border border-line text-turmeric-dark shadow-warm-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-normal text-ink">
                Instant Culinary Swaps
              </h3>
              <p className="text-sm font-sans text-ink-muted leading-relaxed">
                Craving something else or missing ingredients? Swap any meal in one tap with an equal macro alternative tailored to your pantry.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-line bg-bone shadow-warm-sm space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-bone-light border border-line text-herb shadow-warm-sm">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-normal text-ink">
                Long-Arc Trajectory
              </h3>
              <p className="text-sm font-sans text-ink-muted leading-relaxed">
                Watch 7-day moving averages smooth out daily water fluctuations. Celebrate sustained rhythm and nutritional cadence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
