import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { buildRingSegments } from '../../lib/macros';

const RADIUS = 70;
const CENTER = 90;

export interface MacroDonutChartProps {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories: number;
}

/** Today's macro split as a ring — same visual language as the decorative one on the homepage, bound to real plan data. */
export function MacroDonutChart({ protein, carbs, fat, totalCalories }: MacroDonutChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const segments = buildRingSegments({ protein, carbs, fat }, totalCalories);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg viewBox="0 0 180 180" className="h-40 w-40">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="20" />
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {segments.map((segment, index) => (
              <motion.circle
                key={segment.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={activeKey === segment.key ? 24 : 20}
                style={{ pathOffset: segment.offset, cursor: 'pointer' }}
                initial={shouldReduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: segment.share }}
                transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : index * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                onPointerEnter={() => setActiveKey(segment.key)}
                onPointerLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(segment.key)}
                onBlur={() => setActiveKey(null)}
                tabIndex={0}
                role="img"
                aria-label={`${segment.label}: ${segment.grams}g, ${Math.round(segment.share * 100)}%`}
              />
            ))}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-ink">{Math.round(totalCalories)}</span>
          <span className="text-[11px] text-ink-soft">kcal</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-2.5 text-sm text-ink-soft"
            onPointerEnter={() => setActiveKey(segment.key)}
            onPointerLeave={() => setActiveKey(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} aria-hidden="true" />
            <span className={activeKey === segment.key ? 'font-medium text-ink' : ''}>
              {segment.label} · {segment.grams}g ({Math.round(segment.share * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
